"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/checkin", label: "Check-In", icon: "✅" },
  { href: "/journal", label: "Journal", icon: "📓" },
  { href: "/companion", label: "Companion", icon: "🤖" },
  { href: "/voice", label: "Voice Notes", icon: "🎙️" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function AppNav({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-900 text-white h-screen w-64 fixed left-0 top-0 flex flex-col py-6 px-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <span className="text-2xl">🧠</span>
        <span className="text-lg font-bold text-teal-300">MindLens</span>
      </div>

      <div className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-teal-700 text-white font-medium"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-slate-700 pt-4 space-y-2">
        <div className="px-3 py-2 text-xs text-slate-400">
          Signed in as <span className="text-slate-200">{userName ?? "User"}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          🚪 Sign Out
        </button>
      </div>
    </nav>
  );
}
