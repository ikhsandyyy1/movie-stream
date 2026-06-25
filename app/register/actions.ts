"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Password dan konfirmasi password tidak cocok.",
  path: ["confirm_password"],
});

export async function signUp(formData: FormData) {
  const rawEmail = String(formData.get("email") ?? "").trim();
  const rawPassword = String(formData.get("password") ?? "");
  const rawConfirm = String(formData.get("confirm_password") ?? "");
  const next = String(formData.get("next") ?? "/").trim() || "/";

  const parsed = RegisterSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
    confirm_password: rawConfirm,
  });

  if (!parsed.success) {
    redirect(`/register?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const { email, password } = parsed.data;

  // Rate limit: max 3 attempts per email per minute
  const { allowed } = rateLimit(`register:${email}`, 3, 60000);
  if (!allowed) {
    redirect("/register?error=Terlalu banyak percobaan. Coba lagi dalam 1 menit.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login`,
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?success=Daftar berhasil! Silakan cek email untuk verifikasi, atau langsung masuk.");
}
