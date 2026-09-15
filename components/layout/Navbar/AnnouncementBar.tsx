"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import type { Announcement } from "@/lib/frontend-data";

interface AnnouncementBarProps {
  initialAnnouncement?: Announcement | null;
}

const hardcodedPromo = {
  href: "/shop",
  cta: "Shop Now",
} as const;

export default function AnnouncementBar({
  initialAnnouncement,
}: AnnouncementBarProps) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(
    initialAnnouncement ?? null
  );

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "announcements", "active"),
      (snap) => {
        if (snap.exists()) {
          setAnnouncement(snap.data() as Announcement);
        }
      },
      (error) => {
        console.error("Error listening to announcement updates:", error);
      }
    );

    return () => unsub();
  }, []);

  if (!announcement?.text) {
    return <div aria-hidden="true" />;
  }

  return (
    <p className="flex items-center justify-center gap-1.5 font-medium whitespace-nowrap">
      <span>
        {announcement.emoji && (
          <span aria-hidden="true" className="mr-1">
            {announcement.emoji}
          </span>
        )}
        {announcement.text}
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
