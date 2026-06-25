"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(formData: FormData) {
  const titleId = String(formData.get("title_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();

  if (!titleId || !slug) {
    redirect(`/watch/${slug}?error=ID judul tidak valid.`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?error=Silakan masuk untuk menyimpan favorit.&next=/watch/${slug}`);
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select()
    .eq("user_id", user.id)
    .eq("title_id", titleId)
    .maybeSingle();

  if (existing) {
    // Remove from favorites
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("title_id", titleId);
  } else {
    // Add to favorites
    await supabase
      .from("favorites")
      .insert({ user_id: user.id, title_id: titleId });
  }

  revalidatePath(`/watch/${slug}`);
  redirect(`/watch/${slug}`);
}

export async function removeFavorite(formData: FormData) {
  const titleId = String(formData.get("title_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();

  if (!titleId) {
    redirect("/profile/favorites");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("title_id", titleId);

  revalidatePath("/profile/favorites");
  redirect(`/profile/favorites`);
}
