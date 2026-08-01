import {
  Shield,
  Lock,
  FileText,
  Share2,
  UserCheck,
  Mail,
  Database,
  type LucideIcon,
} from "lucide-react";

export type LegalSectionItem = {
  bold?: string;
  text: string;
};

export type LegalSectionData = {
  id: string;
  icon: LucideIcon;
  title: string;
  delay: number;
  paragraphs: string[];
  listItems?: LegalSectionItem[];
};

export const privacyPolicyData: LegalSectionData[] = [
  {
    id: "info-collect",
    icon: FileText,
    title: "1. Information We Collect",
    delay: 0.1,
    paragraphs: [
      "When you use our services, we may collect the following types of information to ensure a seamless premium skincare shopping experience:",
    ],
    listItems: [
      { bold: "Personal information:", text: " Name, email address, and date of birth." },
      { bold: "Contact details:", text: " Phone number and preferred contact methods." },
      { bold: "Shipping address:", text: " Delivery locations for your orders." },
      { bold: "Payment information:", text: " Processed securely through our certified payment partners." },
      { bold: "Device information:", text: " IP address, browser type, and operating system." },
      { bold: "Cookies:", text: " To remember your preferences and cart contents." },
    ],
  },
  {
    id: "how-we-use",
    icon: Database,
    title: "2. How We Use Information",
    delay: 0.2,
    paragraphs: [
      "Your information is used strictly to provide, maintain, and improve our services to you.",
    ],
    listItems: [
      { bold: "Process orders:", text: " Fulfillment, shipping, and order updates." },
      { bold: "Improve services:", text: " Analyzing store performance and user experience." },
      { bold: "Customer support:", text: " Addressing inquiries, returns, or product questions." },
      { bold: "Marketing (optional):", text: " Sending curated skincare tips and exclusive offers (only with your explicit consent)." },
      { bold: "Security:", text: " Fraud prevention and protecting your account." },
    ],
  },
  {
    id: "data-security",
    icon: Lock,
    title: "3. Data Security",
    delay: 0.25,
    paragraphs: [
      "We prioritize the security of your personal data. All sensitive information, including payment details, is encrypted using industry-standard AES-256 encryption both in transit (via SSL/TLS) and at rest.",
      "We maintain strict physical, electronic, and procedural safeguards to protect your data. However, please note that no method of transmission over the Internet is 100% secure.",
    ],
  },
  {
    id: "cookies",
    icon: Shield,
    title: "4. Cookies",
    delay: 0.3,
    paragraphs: [
      "We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.",
      "You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our premium checkout experience.",
    ],
  },
  {
    id: "third-party",
    icon: Share2,
    title: "5. Third-Party Services",
    delay: 0.35,
    paragraphs: [
      "We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, or assist us in analyzing how our service is used.",
      "These third parties include our certified payment processors (e.g., Stripe), analytics providers, and trusted shipping partners (e.g., FedEx, UPS). These parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.",
    ],
  },
  {
    id: "user-rights",
    icon: UserCheck,
    title: "6. User Rights",
    delay: 0.6,
    paragraphs: [
      "You maintain full control over your personal data. Under applicable privacy laws, you have the right to:",
    ],
    listItems: [
      { bold: "Access:", text: " Request a copy of the personal data we hold about you." },
      { bold: "Correction:", text: " Request that we correct any inaccurate or incomplete data." },
      { bold: "Deletion:", text: " Request the deletion of your personal data (\"right to be forgotten\")." },
      { bold: "Withdraw consent:", text: " Opt-out of marketing communications at any time." },
    ],
  },
  {
    id: "contact-info",
    icon: Mail,
    title: "7. Contact Information",
    delay: 0.7,
    paragraphs: [
      "If you have any questions about this Privacy Policy, please contact our dedicated support team:",
    ],
    listItems: [
      { bold: "Email:", text: " privacy@vault-enterprises.com" },
      { bold: "Phone:", text: " +977-9860507044" },
      { bold: "Business address:", text: " NBTC, Khasibazar Level -1 | Shop No. 2171 | Kathmandu" },
    ],
  },
];
