import {
  FileCheck,
  ShoppingCart,
  CreditCard,
  Truck,
  RefreshCcw,
  User,
  Copyright,
  AlertTriangle,
  Edit3,
  Mail,
  Tag
} from "lucide-react";
import { type LegalSectionData } from "./privacyPolicyData";

export const termsData: LegalSectionData[] = [
  {
    id: "acceptance",
    icon: FileCheck,
    title: "1. Acceptance of Terms",
    delay: 0.1,
    paragraphs: [
      "By accessing or using the Vault Enterprises website and services, you agree to be bound by these Terms & Conditions. If you disagree with any part of these terms, you may not access our premium skincare services.",
      "These Terms apply to all visitors, users, and others who access or use our Service."
    ],
  },
  {
    id: "products-pricing",
    icon: Tag,
    title: "2. Products & Pricing",
    delay: 0.2,
    paragraphs: [
      "All premium skincare products are subject to availability. We reserve the right to discontinue any product at any time."
    ],
    listItems: [
      { text: "Prices are displayed in USD and are subject to change without prior notice." },
      { text: "We strive for accuracy in product descriptions, but do not warrant that product descriptions or other content is accurate, complete, or error-free." },
      { text: "Promotional offers are subject to specific terms and may be withdrawn at any time." }
    ]
  },
  {
    id: "orders",
    icon: ShoppingCart,
    title: "3. Orders",
    delay: 0.3,
    paragraphs: [
      "Placing an order constitutes an offer to purchase. We reserve the right to refuse or cancel any order for any reason, including but not limited to:"
    ],
    listItems: [
      { text: "Product availability limits" },
      { text: "Errors in the description or price of the product" },
      { text: "Suspicion of fraudulent or unauthorized transactions" }
    ]
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "4. Payments",
    delay: 0.4,
    paragraphs: [
      "We accept major credit cards and secure online payment methods. By submitting payment information, you grant us the right to provide this information to third parties for purposes of facilitating the completion of your purchases.",
      "Your card will be charged at the time of order confirmation. All payments are processed through secure, encrypted gateways."
    ]
  },
  {
    id: "shipping",
    icon: Truck,
    title: "5. Shipping",
    delay: 0.5,
    paragraphs: [
      "We offer premium shipping options to ensure your skincare products arrive safely and promptly."
    ],
    listItems: [
      { text: "Shipping costs are calculated at checkout based on location and selected speed." },
      { text: "Delivery times are estimates and not guaranteed." },
      { text: "Risk of loss and title for items pass to you upon our delivery to the carrier." }
    ]
  },
  {
    id: "returns-refunds",
    icon: RefreshCcw,
    title: "6. Returns & Refunds",
    delay: 0.6,
    paragraphs: [
      "We stand behind the quality of our premium formulations. If you are not entirely satisfied with your purchase, you may return the unused portion within 30 days of receipt.",
      "Refunds will be processed to the original method of payment within 7-10 business days of receiving the returned item. Original shipping costs are non-refundable."
    ]
  },
  {
    id: "user-responsibilities",
    icon: User,
    title: "7. User Responsibilities",
    delay: 0.7,
    paragraphs: [
      "When creating an account, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for all activities under your account.",
      "You agree not to use our Service for any illegal or unauthorized purpose, nor violate any laws in your jurisdiction."
    ]
  },
  {
    id: "intellectual-property",
    icon: Copyright,
    title: "8. Intellectual Property",
    delay: 0.8,
    paragraphs: [
      "The Service and its original content (excluding User provided content), features, and functionality are and will remain the exclusive property of Vault Enterprises and its licensors.",
      "Our trademarks, trade dress, and premium brand imagery may not be used in connection with any product or service without the prior written consent of Vault Enterprises."
    ]
  },
  {
    id: "limitation-liability",
    icon: AlertTriangle,
    title: "9. Limitation of Liability",
    delay: 0.9,
    paragraphs: [
      "In no event shall Vault Enterprises, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service."
    ]
  },
  {
    id: "changes-terms",
    icon: Edit3,
    title: "10. Changes to Terms",
    delay: 1.0,
    paragraphs: [
      "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms."
    ]
  },
  {
    id: "contact-information",
    icon: Mail,
    title: "11. Contact Information",
    delay: 1.1,
    paragraphs: [
      "If you have any questions about these Terms, please contact us:"
    ],
    listItems: [
      { bold: "Email:", text: " legal@vault-enterprises.com" },
     { bold: "Phone:", text: " +977-9860507044" },
      { bold: "Business address:", text: " NBTC, Khasibazar Level -1 | Shop No. 2171 | Kathmandu" },
    ]
  }
];
