import Link from "next/link";

import { cn } from "@/lib/utils";

interface SidebarItemProps {
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarItem({ label, href, active, onClick }: SidebarItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-r8",
        "text-sm transition-colors duration-150",
        active
          ? "bg-white/5 text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {/* Bullet indicator */}
      <span
        className={cn(
          "text-base leading-none select-none",
          active ? "text-neon-cyan" : "text-muted-foreground",
        )}
        aria-hidden="true"
      >
        •
      </span>
      {label}
    </Link>
  );
}
