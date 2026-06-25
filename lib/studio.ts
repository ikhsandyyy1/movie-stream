import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StudioTitleRow = {
  id: string;
  slug: string;
  title: string;
  type: "movie" | "series";
  tmdb_id: number | null;
  imdb_id: string | null;
  imdb_rank: number | null;
  imdb_rating: number | null;
  imdb_votes: number | null;
  year: number;
  country: string;
  network: string;
  duration: string;
  rating: string;
  synopsis: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_names: string[];
  is_published: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_recently_added: boolean;
  video_sources?: {
    id: string;
    label: string;
    type: "owned" | "official_embed" | "licensed_provider";
    url: string;
    quality: string;
    is_active: boolean;
  }[];
  seasons?: StudioSeasonRow[];
};

export type StudioEpisodeRow = {
  id: string;
  title_id: string;
  season_id: string;
  season_number: number;
  episode_number: number;
  title: string;
  synopsis: string | null;
  duration: string;
  still_path: string | null;
  air_date: string | null;
  is_published: boolean;
  episode_video_sources?: {
    id: string;
    label: string;
    type: "owned" | "official_embed" | "licensed_provider";
    url: string;
    quality: string;
    is_active: boolean;
  }[];
};

export type StudioSeasonRow = {
  id: string;
  title_id: string;
  season_number: number;
  name: string;
  synopsis: string | null;
  poster_path: string | null;
  is_published: boolean;
  episodes?: StudioEpisodeRow[];
};

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData, error } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (error || !userId) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role !== "admin") notFound();

  return {
    supabase,
    admin: {
      id: profile.id as string,
      email: (profile.email as string | null) ?? (typeof claimsData.claims.email === "string" ? claimsData.claims.email : null)
    }
  };
}

export async function recordAuditEvent(input: {
  eventType:
    | "admin_login"
    | "admin_logout"
    | "content_created"
    | "content_updated"
    | "content_deleted"
    | "content_published"
    | "content_unpublished"
    | "media_uploaded"
    | "source_updated"
    | "title_viewed"
    | "title_played"
    | "search_performed";
  actorId?: string | null;
  actorEmail?: string | null;
  titleId?: string | null;
  titleSlug?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    await supabase.from("audit_events").insert({
      event_type: input.eventType,
      actor_id: input.actorId ?? null,
      actor_email: input.actorEmail ?? null,
      title_id: input.titleId ?? null,
      title_slug: input.titleSlug ?? null,
      metadata: input.metadata ?? {}
    });
  } catch {
    // Analytics must not break user-facing routes.
  }
}

export async function getStudioDashboard() {
  const { supabase } = await requireAdmin();
  const [titlesResult, eventsResult] = await Promise.all([
    supabase
      .from("titles")
      .select("*, video_sources(*), seasons(*, episodes(*, episode_video_sources(*)))")
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_events")
      .select("id,event_type,actor_email,title_slug,metadata,created_at")
      .order("created_at", { ascending: false })
      .limit(40)
  ]);
  const safeTitlesResult = titlesResult.error
    ? await supabase
        .from("titles")
        .select("*, video_sources(*)")
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false })
    : titlesResult;

  return {
    titles: ((safeTitlesResult.data ?? []) as StudioTitleRow[]).map((title) => ({
      ...title,
      video_sources: title.video_sources ?? [],
      seasons: (title.seasons ?? [])
        .sort((a, b) => a.season_number - b.season_number)
        .map((season) => ({
          ...season,
          episodes: (season.episodes ?? []).sort((a, b) => a.episode_number - b.episode_number)
        }))
    })),
    events: eventsResult.data ?? []
  };
}
