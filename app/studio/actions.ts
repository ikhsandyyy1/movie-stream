"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { recordAuditEvent, requireAdmin } from "@/lib/studio";

const SlugSchema = z.string().min(1).max(200).regex(/^[a-z0-9-]+$/);
const ContentTypeSchema = z.enum(["movie", "series"]);
const SourceTypeSchema = z.enum(["owned", "official_embed", "licensed_provider"]);
const UuidSchema = z.string().uuid();
const NonEmptyIdSchema = z.string().min(1, "ID cannot be empty");
const TmdbIdSchema = z.number().int().positive().nullable().optional();
const SourceUrlSchema = z.string().url().or(z.string().max(0));
const SeasonNumberSchema = z.number().int().positive();

function text(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? fallback).trim();
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function genresFrom(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanSourceType(value: string) {
  if (value === "owned" || value === "official_embed" || value === "licensed_provider") return value;
  return "official_embed";
}

function cleanContentType(value: string) {
  return value === "series" ? "series" : "movie";
}

async function uploadPublicImage(formData: FormData, key: string, bucket: "posters" | "backdrops", slug: string) {
  const file = formData.get(key);
  if (!(file instanceof File) || file.size === 0) return null;

  const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
  const path = `${slug}/${Date.now()}-${key}.${extension}`;
  const { supabase, admin } = await requireAdmin();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  await recordAuditEvent({
    eventType: "media_uploaded",
    actorId: admin.id,
    actorEmail: admin.email,
    titleSlug: slug,
    metadata: { bucket, path }
  });
  return data.publicUrl;
}

export async function signInAdmin(formData: FormData) {
  const email = text(formData, "email");
  const password = text(formData, "password");

  if (!email || !password) {
    redirect("/studio/login?error=missing");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect("/studio/login?error=invalid");
  }

  const { data: profile } = await supabase.from("profiles").select("role,email").eq("id", data.user.id).maybeSingle();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    notFound();
  }

  await recordAuditEvent({
    eventType: "admin_login",
    actorId: data.user.id,
    actorEmail: (profile.email as string | null) ?? data.user.email ?? null,
    metadata: { provider: "password" }
  });

  redirect("/studio");
}

export async function signOutAdmin() {
  const { supabase, admin } = await requireAdmin();
  await recordAuditEvent({
    eventType: "admin_logout",
    actorId: admin.id,
    actorEmail: admin.email
  });
  await supabase.auth.signOut();
  redirect("/studio/login");
}

export async function saveTitle(formData: FormData) {
  const { supabase, admin } = await requireAdmin();
  const titleId = text(formData, "title_id");
  const sourceId = text(formData, "source_id");
  const titleStr = text(formData, "title");
  const slug = slugify(text(formData, "slug") || titleStr);

  // Validate inputs with Zod
  const titleParse = z.string().min(1).max(500).safeParse(titleStr);
  const slugParse = SlugSchema.safeParse(slug);
  if (!titleParse.success || !slugParse.success) {
    redirect("/studio?error=invalid-title");
  }

  const title = titleParse.data;

  // Validate optional numeric fields
  const tmdbIdNum = Number(text(formData, "tmdb_id")) || null;
  if (tmdbIdNum !== null) {
    const tmdbParse = z.number().int().positive().safeParse(tmdbIdNum);
    if (!tmdbParse.success) {
      redirect("/studio?error=invalid-tmdb-id");
    }
  }

  const previousPublished = formData.get("previous_published") === "true";
  const isPublished = bool(formData, "is_published");
  const posterUrl = await uploadPublicImage(formData, "poster_file", "posters", slug);
  const backdropUrl = await uploadPublicImage(formData, "backdrop_file", "backdrops", slug);

  const payload = {
    slug,
    title,
    type: cleanContentType(text(formData, "type")),
    tmdb_id: Number(text(formData, "tmdb_id")) || null,
    year: Number(text(formData, "year")) || new Date().getFullYear(),
    country: text(formData, "country", "Unknown"),
    network: text(formData, "network", "IMOV"),
    duration: text(formData, "duration", "TBA"),
    rating: text(formData, "rating", "13+"),
    synopsis: text(formData, "synopsis", "Sinopsis belum tersedia."),
    poster_path: posterUrl ?? (text(formData, "poster_path") || null),
    backdrop_path: backdropUrl ?? (text(formData, "backdrop_path") || null),
    genre_names: genresFrom(text(formData, "genre_names")),
    is_published: isPublished,
    is_featured: bool(formData, "is_featured"),
    is_trending: bool(formData, "is_trending"),
    is_recently_added: bool(formData, "is_recently_added"),
    updated_at: new Date().toISOString()
  };

  const result = titleId
    ? await supabase.from("titles").update(payload).eq("id", titleId).select("id,slug").single()
    : await supabase.from("titles").insert(payload).select("id,slug").single();

  if (result.error || !result.data) {
    redirect(`/studio?error=${encodeURIComponent(result.error?.message ?? "save-failed")}`);
  }

  const savedTitleId = result.data.id as string;
  const sourcePayload = {
    title_id: savedTitleId,
    label: text(formData, "source_label", "NxSha TMDb/IMDb embed"),
    type: cleanSourceType(text(formData, "source_type")),
    url: text(formData, "source_url", "https://web.nxsha.app/embed/movie/TMDB_OR_IMDB_ID?sub=id&lang=id"),
    quality: text(formData, "source_quality", "1080p"),
    is_active: true
  };

  const sourceResult = sourceId
    ? await supabase.from("video_sources").update(sourcePayload).eq("id", sourceId)
    : await supabase.from("video_sources").insert(sourcePayload);

  if (sourceResult.error) {
    redirect(`/studio?error=${encodeURIComponent(sourceResult.error.message)}`);
  }

  const eventType = titleId ? "content_updated" : "content_created";
  await recordAuditEvent({
    eventType,
    actorId: admin.id,
    actorEmail: admin.email,
    titleId: savedTitleId,
    titleSlug: slug,
    metadata: { published: isPublished }
  });

  if (previousPublished !== isPublished) {
    await recordAuditEvent({
      eventType: isPublished ? "content_published" : "content_unpublished",
      actorId: admin.id,
      actorEmail: admin.email,
      titleId: savedTitleId,
      titleSlug: slug
    });
  }

  await recordAuditEvent({
    eventType: "source_updated",
    actorId: admin.id,
    actorEmail: admin.email,
    titleId: savedTitleId,
    titleSlug: slug,
    metadata: { type: sourcePayload.type, quality: sourcePayload.quality }
  });

  revalidatePath("/");
  revalidatePath("/studio");
  redirect("/studio?saved=1");
}

export async function saveSeason(formData: FormData) {
  const { supabase, admin } = await requireAdmin();
  const titleId = text(formData, "title_id");
  const titleSlug = text(formData, "title_slug");
  const seasonId = text(formData, "season_id");
  const seasonNumber = Number(text(formData, "season_number")) || 1;

  if (!NonEmptyIdSchema.safeParse(titleId).success) notFound();

  if (seasonNumber < 1) redirect("/studio?error=invalid-season");

  const payload = {
    title_id: titleId,
    season_number: seasonNumber,
    name: text(formData, "season_name", `Season ${seasonNumber}`),
    synopsis: text(formData, "season_synopsis") || null,
    poster_path: text(formData, "season_poster_path") || null,
    is_published: bool(formData, "season_is_published"),
    updated_at: new Date().toISOString()
  };

  const result = seasonId
    ? await supabase.from("seasons").update(payload).eq("id", seasonId)
    : await supabase.from("seasons").insert(payload);

  if (result.error) redirect(`/studio?error=${encodeURIComponent(result.error.message)}`);

  await recordAuditEvent({
    eventType: "content_updated",
    actorId: admin.id,
    actorEmail: admin.email,
    titleId,
    titleSlug,
    metadata: { part: "season", season: seasonNumber }
  });

  revalidatePath("/");
  revalidatePath(`/watch/${titleSlug}`);
  revalidatePath("/studio");
  redirect("/studio?saved=1");
}

export async function saveEpisode(formData: FormData) {
  const { supabase, admin } = await requireAdmin();
  const titleId = text(formData, "title_id");
  const titleSlug = text(formData, "title_slug");
  const seasonId = text(formData, "season_id");
  const episodeId = text(formData, "episode_id");
  const sourceId = text(formData, "episode_source_id");
  const seasonNumber = Number(text(formData, "episode_season_number")) || 1;
  const episodeNumber = Number(text(formData, "episode_number")) || 1;

  if (!NonEmptyIdSchema.safeParse(titleId).success || !NonEmptyIdSchema.safeParse(seasonId).success) notFound();

  if (episodeNumber < 1) redirect("/studio?error=invalid-episode");

  const payload = {
    title_id: titleId,
    season_id: seasonId,
    season_number: seasonNumber,
    episode_number: episodeNumber,
    title: text(formData, "episode_title", `Episode ${episodeNumber}`),
    synopsis: text(formData, "episode_synopsis") || null,
    duration: text(formData, "episode_duration", "TBA"),
    still_path: text(formData, "episode_still_path") || null,
    air_date: text(formData, "episode_air_date") || null,
    is_published: bool(formData, "episode_is_published"),
    updated_at: new Date().toISOString()
  };

  const result = episodeId
    ? await supabase.from("episodes").update(payload).eq("id", episodeId).select("id").single()
    : await supabase.from("episodes").insert(payload).select("id").single();

  if (result.error || !result.data) {
    redirect(`/studio?error=${encodeURIComponent(result.error?.message ?? "episode-save-failed")}`);
  }

  const savedEpisodeId = result.data.id as string;
  const sourcePayload = {
    episode_id: savedEpisodeId,
    title_id: titleId,
    label: text(formData, "episode_source_label", "NxSha TMDb/IMDb embed"),
    type: cleanSourceType(text(formData, "episode_source_type")),
    url: text(formData, "episode_source_url", "https://web.nxsha.app/embed/tv/TMDB_OR_IMDB_ID/1/1?sub=id&lang=id"),
    quality: text(formData, "episode_source_quality", "1080p"),
    is_active: bool(formData, "episode_source_is_active")
  };

  const sourceResult = sourceId
    ? await supabase.from("episode_video_sources").update(sourcePayload).eq("id", sourceId)
    : await supabase.from("episode_video_sources").insert(sourcePayload);

  if (sourceResult.error) redirect(`/studio?error=${encodeURIComponent(sourceResult.error.message)}`);

  await recordAuditEvent({
    eventType: "source_updated",
    actorId: admin.id,
    actorEmail: admin.email,
    titleId,
    titleSlug,
    metadata: { part: "episode", season: seasonNumber, episode: episodeNumber }
  });

  revalidatePath("/");
  revalidatePath(`/watch/${titleSlug}`);
  revalidatePath(`/watch/${titleSlug}/season/${seasonNumber}/episode/${episodeNumber}`);
  revalidatePath("/studio");
  redirect("/studio?saved=1");
}

export async function deleteSeason(formData: FormData) {
  const { supabase, admin } = await requireAdmin();
  const seasonId = text(formData, "season_id");
  const titleId = text(formData, "title_id");
  const titleSlug = text(formData, "title_slug");
  const seasonNumber = Number(text(formData, "season_number")) || null;

  if (!NonEmptyIdSchema.safeParse(seasonId).success || !NonEmptyIdSchema.safeParse(titleId).success) notFound();

  const { error } = await supabase.from("seasons").delete().eq("id", seasonId);
  if (error) redirect(`/studio?error=${encodeURIComponent(error.message)}`);

  await recordAuditEvent({
    eventType: "content_updated",
    actorId: admin.id,
    actorEmail: admin.email,
    titleId,
    titleSlug,
    metadata: { part: "season_deleted", season: seasonNumber }
  });

  revalidatePath("/");
  revalidatePath(`/watch/${titleSlug}`);
  revalidatePath("/studio");
  redirect("/studio?deleted=1");
}

export async function deleteEpisode(formData: FormData) {
  const { supabase, admin } = await requireAdmin();
  const episodeId = text(formData, "episode_id");
  const titleId = text(formData, "title_id");
  const titleSlug = text(formData, "title_slug");
  const seasonNumber = Number(text(formData, "season_number")) || null;
  const episodeNumber = Number(text(formData, "episode_number")) || null;

  if (!NonEmptyIdSchema.safeParse(episodeId).success || !NonEmptyIdSchema.safeParse(titleId).success) notFound();

  const { error } = await supabase.from("episodes").delete().eq("id", episodeId);
  if (error) redirect(`/studio?error=${encodeURIComponent(error.message)}`);

  await recordAuditEvent({
    eventType: "content_updated",
    actorId: admin.id,
    actorEmail: admin.email,
    titleId,
    titleSlug,
    metadata: { part: "episode_deleted", season: seasonNumber, episode: episodeNumber }
  });

  revalidatePath("/");
  revalidatePath(`/watch/${titleSlug}`);
  revalidatePath("/studio");
  redirect("/studio?deleted=1");
}

export async function deleteTitle(formData: FormData) {
  const { supabase, admin } = await requireAdmin();
  const titleId = text(formData, "title_id");
  const titleSlug = text(formData, "slug");

  if (!NonEmptyIdSchema.safeParse(titleId).success) notFound();

  const { error } = await supabase.from("titles").delete().eq("id", titleId);
  if (error) redirect(`/studio?error=${encodeURIComponent(error.message)}`);

  await recordAuditEvent({
    eventType: "content_deleted",
    actorId: admin.id,
    actorEmail: admin.email,
    titleId,
    titleSlug
  });

  revalidatePath("/");
  revalidatePath("/studio");
  redirect("/studio?deleted=1");
}
