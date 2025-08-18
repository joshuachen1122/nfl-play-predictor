"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { cn } from "@/components/utils";
import { Menu } from "lucide-react";
import { useState } from "react";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          {site.name}
        </Link>
        <nav className="hidden gap-6 md:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm text-gray-700 hover:text-black",
                pathname === item.href && "font-semibold text-black",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden" aria-label="Open menu" onClick={() => setOpen((v) => !v)}>
          <Menu />
        </button>
      </div>
      {open && (
        <div className="border-t bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "py-2 text-sm text-gray-700 hover:text-black",
                  pathname === item.href && "font-semibold text-black",
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}