"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Chat",     href: "/"         },
  { label: "Recipes",  href: "/recipes"  },
  { label: "List",     href: "/list" },
  { label: "Pantry",   href: "/pantry"   },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-zinc-800 bg-zinc-950 px-6">
      <div className="mr-8 flex items-center gap-2">
        <Image src="/cookbook.svg" alt="Cookbook" width={24} height={24} />
        <span className="text-sm font-semibold text-zinc-100">AI Recipe Keeper</span>
      </div>
      <nav className="flex gap-1">
        {TABS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
