import { FaFacebookF, FaInstagram, FaTiktok } from "@/components/icons/SocialIcons";
import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  iconClassName?: string;
  tooltipClassName?: string;
}

export const socialLinks = [
  {
    title: "Facebook",
    href: "https://www.facebook.com/vaultskinco",
    icon: FaFacebookF,
  },
  {
    title: "Instagram",
    href: "https://www.instagram.com/vaultskin.co",
    icon: FaInstagram,
  },
  {
    title: "TikTok",
    href: "https://www.tiktok.com/@vaultskinnepal",
    icon: FaTiktok,
  },
];

const SocialMedia = ({ className, iconClassName, tooltipClassName }: Props) => {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-3", className)}>
        {socialLinks.map((link) => {
          const Icon = link.icon;

          return (
            <Tooltip key={link.title}>
              <TooltipTrigger>
                <Link
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.title}
                  className={cn(
                    "flex items-center justify-center rounded-full border border-primary p-1.5 text-white transition-colors duration-300 hover:text-accent hover:border-primary/80 hoverEffect",
                    iconClassName,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>

              <TooltipContent>
                <p
                  className={cn(
                    "text-sm bg-white text-black font-semibold border rounded p-1",
                    tooltipClassName,
                  )}
                >
                  {link.title}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default SocialMedia;
