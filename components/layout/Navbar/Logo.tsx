import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      href="/"
      className={cn(
        "block hover:opacity-90 transition-opacity duration-200",
        className
      )}
    >
      <Image
        src="/Images/logo.svg"
        alt="Vault Enterprises Logo"
        width={300}
        height={100}
        className="h-14 md:h-16 w-auto object-contain scale-[1.3] md:scale-[1.5] origin-left"
      />
    </Link>
  );
};

export default Logo;