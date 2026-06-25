"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function signIn(formData: FormData) {
  const rawEmail = String(formData.get("email") ?? "").trim();
  const rawPassword = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/").trim() || "/";

  const parsed = LoginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0].message)}&next=${encodeURIComponent(next)}`);
  }

  const { email, password } = parsed.data;

  // Rate limit: max 5 attempts per email per minute
  const { allowed } = rateLimit(`login:${email}`, 5, 60000);
  if (!allowed) {
    redirect(`/login?error=${encodeURIComponent("Terlalu banyak percobaan. Coba lagi dalam 1 menit.")}&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Email atau password tidak valid.")}&next=${encodeURIComponent(next)}`);
  }

  redirect(next.startsWith("/") ? next : "/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/studio/login");
}

export async function signOutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
