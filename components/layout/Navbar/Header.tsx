import Container from "@/components/Container";
import { Mail, Phone } from "lucide-react";
import { getActiveAnnouncement } from "@/lib/frontend-data";
import AnnouncementBar from "./AnnouncementBar";

const contacts = [
  { type: "email", label: "info@vaultskin.co", href: "mailto:info@vaultskin.co", Icon: Mail },
  { type: "phone", label: "+977 9840320862", href: "tel:+9779840320862", Icon: Phone },
] as const;

const Header = async () => {
  const announcement = await getActiveAnnouncement();

  return (
    <header className="bg-primary text-white">
      <Container>
        <div className="grid min-h-[44px] py-1 grid-cols-1 items-center text-xs md:grid-cols-3 md:text-sm">
          {/* Spacer (desktop only) keeps promo centered in 3-col grid */}
          <div className="hidden md:block" aria-hidden="true" />

          {/* Promo - rendered with initial SSR data and synced live with Firestore */}
          <AnnouncementBar initialAnnouncement={announcement} />

          {/* Contacts (desktop only) */}
          <nav aria-label="Contact" className="hidden items-center justify-end gap-5 lg:flex">
            {contacts.map(({ type, label, href, Icon }) => (
              <a key={type} href={href} className="flex items-center gap-1.5 transition-colors hover:text-accent">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{label}</span>
              </a>
            ))}
          </nav>
        </div>
      </Container>
    </header>
  );
};

export default Header;
