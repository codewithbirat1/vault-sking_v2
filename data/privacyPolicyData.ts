import {
  Shield,
  Lock,
  FileText,
  Share2,
  UserCheck,
  Mail,
  Database,
  Cookie,
  ShoppingBag,
  HeartPulse,
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
      "When you visit Vault Skin, create an account, place an order, contact us, or otherwise use our services, we may collect information that is necessary to provide you with a secure and seamless skincare shopping experience.",
    ],
    listItems: [
      {
        bold: "Personal information:",
        text: " Your name and other information you voluntarily provide to us.",
      },
      {
        bold: "Contact details:",
        text: " Email address and phone number used for communication and order updates.",
      },
      {
        bold: "Shipping information:",
        text: " Delivery address, city, district, and other information required to deliver your order.",
      },
      {
        bold: "Order information:",
        text: " Products purchased, quantities, order value, order status, returns, refunds, and purchase history.",
      },
      {
        bold: "Payment information:",
        text: " Payment and transaction information processed through our payment partners. We do not intentionally store complete payment credentials such as card PINs or passwords.",
      },
      {
        bold: "Account information:",
        text: " Login credentials and account-related information when you create an account with us.",
      },
      {
        bold: "Device information:",
        text: " IP address, browser type, device type, operating system, and technical information about how you access our website.",
      },
      {
        bold: "Cookies and usage information:",
        text: " Information about pages viewed, products viewed, cart activity, preferences, and interactions with our website.",
      },
    ],
  },

  {
    id: "skin-information",
    icon: HeartPulse,
    title: "2. Skincare & Product Preference Information",
    delay: 0.1,
    paragraphs: [
      "Because Vault Skin specializes in skincare products, you may voluntarily provide information about your skincare preferences, skin type, skin concerns, or products you are interested in.",
      "This information may be used to help us answer product-related questions, improve your shopping experience, and provide relevant product information or recommendations.",
      "Please avoid providing medical records, diagnoses, prescription information, or other sensitive health information through our website unless specifically requested and necessary.",
      "Vault Skin provides cosmetic and product information only. Product recommendations are not medical diagnosis or medical treatment and should not replace advice from a qualified healthcare professional.",
    ],
  },

  {
    id: "how-we-use",
    icon: Database,
    title: "3. How We Use Your Information",
    delay: 0.15,
    paragraphs: [
      "We use the information we collect only for legitimate business purposes and to provide, maintain, improve, and secure our services.",
    ],
    listItems: [
      {
        bold: "Process orders:",
        text: " To confirm, fulfill, package, ship, and manage your purchases.",
      },
      {
        bold: "Order communication:",
        text: " To send order confirmations, payment updates, delivery information, and other service-related messages.",
      },
      {
        bold: "Customer support:",
        text: " To respond to questions, complaints, returns, refunds, replacements, and product inquiries.",
      },
      {
        bold: "Improve our services:",
        text: " To understand website usage, improve our products and services, and enhance customer experience.",
      },
      {
        bold: "Personalization:",
        text: " To remember preferences and provide relevant products or content.",
      },
      {
        bold: "Marketing:",
        text: " To send skincare tips, product updates, offers, and promotional communications where permitted and, where required, with your consent.",
      },
      {
        bold: "Security:",
        text: " To detect suspicious activity, prevent fraud, protect accounts, and maintain website security.",
      },
      {
        bold: "Legal compliance:",
        text: " To comply with applicable laws, regulations, lawful requests, and legal obligations.",
      },
    ],
  },

  {
    id: "data-security",
    icon: Lock,
    title: "4. Data Security",
    delay: 0.25,
    paragraphs: [
      "We take reasonable technical and organizational measures to protect your personal information from unauthorized access, misuse, loss, alteration, disclosure, or destruction.",
      "Where appropriate, we use security technologies such as HTTPS/TLS encryption to protect information transmitted between your device and our website.",
      "Payment transactions may be handled by third-party payment providers that apply their own security controls and requirements.",
      "Although we take reasonable precautions to protect your information, no method of transmitting or storing information electronically can be guaranteed to be completely secure.",
    ],
  },

  {
    id: "cookies",
    icon: Cookie,
    title: "5. Cookies & Tracking Technologies",
    delay: 0.3,
    paragraphs: [
      "Vault Skin may use cookies and similar technologies to operate our website, remember your preferences, maintain shopping-cart functionality, understand website usage, and improve your shopping experience.",
      "Depending on the services we use, cookies or similar technologies may also be used for analytics, advertising, campaign measurement, and personalization.",
    ],
    listItems: [
      {
        bold: "Essential cookies:",
        text: " Required for important website functions such as shopping carts, login sessions, and checkout.",
      },
      {
        bold: "Preference cookies:",
        text: " Used to remember settings and preferences.",
      },
      {
        bold: "Analytics cookies:",
        text: " Help us understand how visitors use our website and improve performance.",
      },
      {
        bold: "Marketing cookies:",
        text: " May be used to measure advertising campaigns or provide relevant advertisements where applicable.",
      },
    ],
  },

  {
    id: "orders-payments",
    icon: ShoppingBag,
    title: "6. Orders & Payments",
    delay: 0.35,
    paragraphs: [
      "When you place an order with Vault Skin, we collect the information necessary to process and deliver your purchase.",
      "This may include your name, phone number, email address, delivery address, products purchased, order value, payment status, and transaction reference information.",
      "Payments may be processed through third-party payment gateways. Your payment provider may collect and process payment information according to its own terms and privacy policy.",
      "Vault Skin does not intentionally store sensitive payment credentials such as card PINs, passwords, or complete payment authentication credentials.",
    ],
  },

  {
    id: "third-party",
    icon: Share2,
    title: "7. Third-Party Services",
    delay: 0.4,
    paragraphs: [
      "We may use trusted third-party service providers to help operate our business and provide services to you.",
      "These providers receive only the information reasonably necessary to perform the services they provide to Vault Skin and may include:",
    ],
    listItems: [
      {
        bold: "Payment providers:",
        text: " To securely process and verify transactions.",
      },
      {
        bold: "Courier and logistics providers:",
        text: " To deliver your orders using information such as your name, phone number, and delivery address.",
      },
      {
        bold: "Hosting and technology providers:",
        text: " To host, maintain, secure, and operate our website and databases.",
      },
      {
        bold: "Analytics providers:",
        text: " To understand website traffic, performance, and customer interactions.",
      },
      {
        bold: "Marketing platforms:",
        text: " To manage and measure advertising or promotional campaigns where applicable.",
      },
      {
        bold: "Communication providers:",
        text: " To send email, SMS, WhatsApp, or other customer notifications where applicable.",
      },
    ],
  },

  {
    id: "legal-disclosure",
    icon: Shield,
    title: "8. Legal Disclosure & Protection",
    delay: 0.45,
    paragraphs: [
      "We may disclose personal information when reasonably necessary to comply with applicable laws, regulations, court orders, lawful governmental requests, or other legal obligations.",
      "We may also disclose information when necessary to protect the rights, property, security, or safety of Vault Skin, our customers, our service providers, or other persons, or to investigate suspected fraud or misuse of our services.",
      "We will not disclose your personal information for unrelated purposes unless permitted or required by applicable law or with your permission.",
    ],
  },

  {
    id: "data-retention",
    icon: Database,
    title: "9. Data Retention",
    delay: 0.5,
    paragraphs: [
      "We retain personal information only for as long as reasonably necessary to provide our services, complete transactions, maintain appropriate business records, resolve disputes, prevent fraud, enforce our agreements, and comply with applicable legal obligations.",
      "When personal information is no longer reasonably required, we may delete, anonymize, or securely dispose of it, subject to applicable legal and operational requirements.",
    ],
  },

  {
    id: "user-rights",
    icon: UserCheck,
    title: "10. Your Privacy Rights",
    delay: 0.55,
    paragraphs: [
      "Depending on applicable law, you may have rights regarding the personal information we hold about you.",
    ],
    listItems: [
      {
        bold: "Access:",
        text: " Request information about the personal data we hold about you.",
      },
      {
        bold: "Correction:",
        text: " Request correction of inaccurate or incomplete information.",
      },
      {
        bold: "Deletion:",
        text: " Request deletion of certain personal information where legally applicable.",
      },
      {
        bold: "Marketing opt-out:",
        text: " Unsubscribe from promotional communications at any time.",
      },
      {
        bold: "Withdraw consent:",
        text: " Withdraw consent where processing is based on your consent.",
      },
      {
        bold: "Privacy questions:",
        text: " Ask questions or raise concerns about how your information is handled.",
      },
    ],
  },

  {
    id: "marketing",
    icon: Mail,
    title: "11. Marketing Communications",
    delay: 0.6,
    paragraphs: [
      "Where permitted by applicable law, Vault Skin may send promotional communications about products, offers, discounts, skincare information, new launches, and other updates.",
      "You can unsubscribe from marketing emails by using the unsubscribe option included in the relevant communication or by contacting us directly.",
      "Even if you opt out of promotional communications, we may continue to send essential service-related communications, such as order confirmations, delivery updates, payment notifications, and important account information.",
    ],
  },

  {
    id: "reviews",
    icon: UserCheck,
    title: "12. Reviews & User Content",
    delay: 0.65,
    paragraphs: [
      "If you voluntarily submit product reviews, ratings, comments, photographs, testimonials, or other content to Vault Skin, we may display or use that content to improve our services, provide product information, or promote Vault Skin, subject to applicable permissions and laws.",
      "Please avoid including sensitive personal information in public reviews, comments, photographs, or other content.",
    ],
  },

  {
    id: "children",
    icon: Shield,
    title: "13. Children's Privacy",
    delay: 0.7,
    paragraphs: [
      "Our website is intended for general consumers and is not designed to knowingly collect personal information from children where such collection is prohibited by applicable law.",
      "If you believe that a child has provided personal information to Vault Skin improperly, please contact us so that we can review the information and take appropriate action.",
    ],
  },

  {
    id: "third-party-links",
    icon: Share2,
    title: "14. Third-Party Links",
    delay: 0.75,
    paragraphs: [
      "Our website may contain links to third-party websites, social-media platforms, payment services, advertisements, or other external services.",
      "Vault Skin does not control the privacy practices of these third parties. When you access a third-party website or service, its own privacy policy and terms may apply.",
      "We recommend reviewing the privacy policy of any third-party service before providing personal information.",
    ],
  },

  {
    id: "policy-changes",
    icon: FileText,
    title: "15. Changes to This Privacy Policy",
    delay: 0.8,
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes in our business, website functionality, technology, third-party services, legal requirements, or privacy practices.",
      "When we make changes, we will update the 'Last Updated' date displayed on this page. We encourage you to review this Privacy Policy periodically.",
    ],
  },

  {
    id: "contact-info",
    icon: Mail,
    title: "16. Contact Information",
    delay: 0.85,
    paragraphs: [
      "If you have questions, concerns, requests, or complaints regarding this Privacy Policy or the handling of your personal information, please contact Vault Skin using the information below:",
    ],
    listItems: [
      {
        bold: "Email:",
        text: " privacy@vault-enterprises.com",
      },
      {
        bold: "Phone:",
        text: " +977-9860507044",
      },
      {
        bold: "Business address:",
        text: " NBTC, Khasibazar Level -1 | Shop No. 2171 | Kathmandu, Nepal",
      },
      {
        text: "For any questions, concerns, or complaints regarding this Privacy Policy or the handling of your personal information, please contact Vault Skin using the information above.",
      },
    
    ],
  },
];