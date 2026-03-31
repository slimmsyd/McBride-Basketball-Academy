"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Layers, Calendar, ClipboardList } from "lucide-react";

const NAV_ITEMS = [
  { label: "Programs", href: "/admin", icon: Layers },
  { label: "Schedule", href: "/admin/schedule", icon: Calendar },
  { label: "Bookings", href: "/admin/bookings", icon: ClipboardList },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-[#18181B] flex flex-col gap-8 p-6 pt-6 flex-shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <Link href="/admin" className="flex items-center gap-2.5 px-2">
        <div className="w-8 h-8 rounded-lg bg-[#2979FF] flex items-center justify-center">
          <span className="font-[family-name:var(--font-headline)] text-xs font-extrabold text-white">IM</span>
        </div>
        <span className="font-[family-name:var(--font-headline)] text-base font-bold text-white">
          IMB Admin
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#27272A] text-white font-semibold"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#27272A]/50"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white" : "text-[#71717A]"} />
              <span className="font-[family-name:var(--font-body)]">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
