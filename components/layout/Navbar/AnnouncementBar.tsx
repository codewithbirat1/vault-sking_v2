import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Announcement } from "@/lib/frontend-data";

interface AnnouncementBarProps {
  initialAnnouncement?: Announcement | null;
}

const hardcodedPromo = {
  href: "/offers",
  cta: "Shop Now",
} as const;

export default function AnnouncementBar({
  initialAnnouncement,
}: AnnouncementBarProps) {
  if (!initialAnnouncement?.text) {
    return <div aria-hidden="true" />;
  }

  return (
    <p className="flex items-center justify-center gap-1.5 font-medium whitespace-nowrap">
      <span>
        {initialAnnouncement.emoji && (
          <span aria-hidden="true" className="mr-1">
            {initialAnnouncement.emoji}
          </span>
        )}
        {initialAnnouncement.text}
      </span>
      <Link
        href={hardcodedPromo.href}
        className="inline-flex items-center gap-1 underline-offset-4 transition-colors hover:text-accent md:underline"
      >
        <span className="hidden md:inline">{hardcodedPromo.cta}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </p>
  );
}
