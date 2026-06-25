"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Clapperboard,
  Film,
  Heart,
  Home,
  LogIn,
  Search,
  Tv,
  User
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/browse", label: "Jelajahi" },
  { href: "/movies", label: "Film" },
  { href: "/series", label: "Serial TV" },
  { href: "/ranking", label: "Papan Peringkat" }
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<{ user: { id: string } } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isLoggedIn = !!session;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <Clapperboard size={19} />
            </span>
            <span>IMOV</span>
          </Link>

          <nav className="desktop-nav" aria-label="Navigasi utama">
            {navItems.map((item) => (
              <Link
                className={`nav-link${pathname === item.href ? " active" : ""}`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="topbar-actions">
            <Link className="icon-button" href="/search" aria-label="Cari film dan serial">
              <Search size={20} />
            </Link>
            {isLoggedIn ? (
              <Link className="icon-button" href="/profile" aria-label="Profil">
                <User size={20} />
              </Link>
            ) : (
              <Link className="button" href="/login" style={{ fontSize: 13, padding: "0 12px", minHeight: 36 }}>
                <LogIn size={16} />
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      <main id="content">{children}</main>

      <nav className="bottom-nav" aria-label="Navigasi mobile">
        <Link
          href="/"
          className={pathname === "/" ? "active" : ""}
        >
          <Home aria-hidden="true" />
          Home
        </Link>
        <Link
          href="/browse"
          className={pathname === "/browse" ? "active" : ""}
        >
          <Film aria-hidden="true" />
          Browse
        </Link>
        <Link
          href="/movies"
          className={pathname === "/movies" ? "active" : ""}
        >
          <Clapperboard aria-hidden="true" />
          Movies
        </Link>
        <Link
          href="/series"
          className={pathname === "/series" ? "active" : ""}
        >
          <Tv aria-hidden="true" />
          Series
        </Link>
        <Link
          href="/search"
          className={pathname === "/search" ? "active" : ""}
        >
          <Search aria-hidden="true" />
          Search
        </Link>
      </nav>
    </div>
  );
}
