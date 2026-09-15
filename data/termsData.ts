
import {
  FileCheck,
  ShoppingCart,
  CreditCard,
  Truck,
  RefreshCcw,
  User,
  Copyright,
  Tag,
  ShieldCheck,
  Ban,
  Scale,
} from "lucide-react";

import { type LegalSectionData } from "./privacyPolicyData";

export const termsData: LegalSectionData[] = [
  {
    id: "acceptance-eligibility",
    icon: FileCheck,
    title: "1. Acceptance & Eligibility",
    delay: 0.1,
    paragraphs: [
      "Welcome to Vault Skin. These Terms & Conditions govern your use of the Vault Skin website, online store, products, services, and related features.",

      "By accessing our website, creating an account, placing an order, or using our services, you agree to these Terms & Conditions, our Privacy Policy, Return & Refund Policy, and other policies published on our website.",

      "You are responsible for providing accurate information and maintaining the security of your account. You must not use another person's account, provide false information, attempt unauthorized access, or use our services for unlawful purposes.",

      "Where required by law, purchases made by minors should be completed with the involvement or permission of a parent or legal guardian.",
    ],
  },

  {
    id: "products",
    icon: Tag,
    title: "2. Products & Product Information",
    delay: 0.1,
    paragraphs: [
      "Vault Skin makes reasonable efforts to provide accurate product names, descriptions, ingredients, usage information, images, sizes, prices, and availability.",

      "Product packaging, labeling, color, or appearance may vary from website images due to manufacturer updates. Product availability may also change without prior notice.",

      "Customers should carefully review product descriptions, ingredients, directions, warnings, and other available information before purchasing or using a product.",

      "Vault Skin provides skincare and personal-care products for cosmetic purposes. Product information is not medical advice, and individual skin reactions may vary.",
    ],
  },

  {
    id: "pricing-promotions",
    icon: Tag,
    title: "3. Pricing & Promotions",
    delay: 0.2,
    paragraphs: [
      "All prices displayed on Vault Skin are in Nepalese Rupees (NPR), unless otherwise stated.",

      "We make reasonable efforts to maintain accurate pricing and promotional information, but technical, typographical, or system errors may occasionally occur.",

      "The applicable price is generally the price displayed when the order is placed, subject to product availability and correction of obvious errors. Delivery charges or other applicable fees may be shown separately during checkout.",
    ],
    listItems: [
      {
        text: "Prices may change without prior notice, subject to applicable law.",
      },
      {
        text: "Discounts, coupons, bundles, and promotions may have separate eligibility, validity, or usage limits.",
      },
      {
        text: "Vault Skin may correct pricing or promotional errors and cancel affected orders where reasonably necessary.",
      },
    ],
  },

  {
    id: "orders",
    icon: ShoppingCart,
    title: "4. Orders & Order Acceptance",
    delay: 0.2,
    paragraphs: [
      "Placing an order through our website is a request to purchase the selected products. Orders are subject to product availability, payment verification, delivery feasibility, and acceptance by Vault Skin.",

      "An order confirmation confirms that we received your order but does not necessarily guarantee final fulfillment. We may review orders before dispatch.",

      "Vault Skin may refuse, limit, suspend, or cancel an order where reasonably necessary.",
    ],
    listItems: [
      {
        text: "The product is unavailable, out of stock, or discontinued.",
      },
      {
        text: "There is an incorrect price, product detail, discount, or technical error.",
      },
      {
        text: "Customer or delivery information is incorrect, incomplete, or cannot be verified.",
      },
      {
        text: "Fraud, unauthorized payment, duplicate orders, or suspicious purchasing activity is suspected.",
      },
      {
        text: "The requested location is outside our available delivery coverage.",
      },
    ],
  },

  {
    id: "payments",
    icon: CreditCard,
    title: "5. Payments",
    delay: 0.3,
    paragraphs: [
      "Vault Skin may offer online payment methods and/or cash on delivery where available. Available payment methods may vary by location, order, or operational requirements.",

      "Online payments may be processed through third-party payment providers. Customers are responsible for using a valid and authorized payment method.",

      "Vault Skin does not intentionally store complete card numbers, PINs, passwords, or other sensitive payment credentials unless necessary and legally permitted.",
    ],
    listItems: [
      {
        text: "Orders may remain pending until payment is successfully verified.",
      },
      {
        text: "Failed, reversed, disputed, or unpaid transactions may result in delayed or cancelled orders.",
      },
      {
        text: "Customers must not use stolen or unauthorized payment information.",
      },
      {
        text: "Refund timing may depend on the relevant payment provider or financial institution.",
      },
    ],
  },

  {
    id: "shipping-delivery",
    icon: Truck,
    title: "6. Shipping & Delivery",
    delay: 0.35,
    paragraphs: [
      "Vault Skin works with delivery partners to deliver orders to the address and contact information provided during checkout.",

      "Customers are responsible for providing a complete and accurate delivery address, phone number, recipient details, and other information needed for successful delivery.",

      "Estimated delivery times may vary due to location, product availability, weather, holidays, courier operations, traffic, and other circumstances beyond our reasonable control.",

      "Delivery estimates are provided for guidance and are not guaranteed unless expressly stated otherwise.",
    ],
    listItems: [
      {
        text: "Additional delivery attempts or charges may apply when an incorrect address or unavailable recipient causes delivery failure.",
      },
      {
        text: "Some locations may have limited delivery availability.",
      },
      {
        text: "Customers should inspect packages and promptly report damage, tampering, incorrect items, or missing products.",
      },
    ],
  },

  {
    id: "cancellation",
    icon: Ban,
    title: "7. Order Cancellation",
    delay: 0.4,
    paragraphs: [
      "Customers may request cancellation before an order has been dispatched, subject to the order status and Vault Skin's ability to process the request.",

      "Once an order has been dispatched, cancellation may no longer be possible and the order may instead be handled under our Return & Refund Policy.",

      "Vault Skin may cancel an order where a product is unavailable, payment cannot be verified, delivery cannot reasonably be completed, incorrect information is provided, or suspicious activity is identified.",

      "If an order is cancelled after payment has been received, any applicable refund will be processed according to our refund procedures and payment-provider timelines.",
    ],
  },

  {
    id: "returns-replacements-refunds",
    icon: RefreshCcw,
    title: "8. Returns, Replacements & Refunds",
    delay: 0.45,
    paragraphs: [
      "Because skincare and personal-care products involve hygiene and product-safety considerations, returns, replacements, and refunds are subject to our Return & Refund Policy.",

      "Customers should contact Vault Skin promptly if a product is damaged, incorrect, defective, missing, or otherwise does not match the order. We may request order details, photographs, videos, or other reasonable evidence.",
    ],
    listItems: [
      {
        bold: "Damaged product:",
        text: " May be eligible for replacement or refund when reported within the applicable period.",
      },
      {
        bold: "Wrong product:",
        text: " Contact us promptly for an appropriate resolution.",
      },
      {
        bold: "Missing product:",
        text: " Contact us with the order details so the issue can be investigated.",
      },
      {
        bold: "Defective product:",
        text: " May be eligible for replacement or refund after verification.",
      },
      {
        bold: "Opened or used products:",
        text: " Generally not eligible for return for hygiene reasons unless defective, damaged, incorrect, or required by law.",
      },
      {
        bold: "Change of mind:",
        text: " May not be accepted unless expressly permitted by our Return & Refund Policy.",
      },
      {
        bold: "Refunds:",
        text: " Approved refunds are normally returned through the applicable payment method, subject to provider processing times.",
      },
    ],
  },

  {
    id: "customer-responsibilities",
    icon: User,
    title: "9. Customer Responsibilities & Prohibited Use",
    delay: 0.5,
    paragraphs: [
      "Customers agree to use the Vault Skin website, accounts, products, and services responsibly and in accordance with these Terms & Conditions and applicable laws.",
    ],
    listItems: [
      {
        text: "Provide accurate and complete information when creating an account or placing an order.",
      },
      {
        text: "Follow product instructions, warnings, storage requirements, and manufacturer recommendations.",
      },
      {
        text: "Do not submit fraudulent orders or use stolen or unauthorized payment methods.",
      },
      {
        text: "Do not attempt unauthorized access to accounts, servers, databases, APIs, or systems.",
      },
      {
        text: "Do not interfere with, damage, overload, or compromise the website or its security.",
      },
      {
        text: "Do not upload malware, viruses, malicious scripts, or harmful code.",
      },
      {
        text: "Do not scrape, copy, or collect website content through unauthorized automated tools.",
      },
      {
        text: "Do not use our services for unlawful, fraudulent, abusive, or harmful activities.",
      },
    ],
  },

  {
    id: "content-intellectual-property",
    icon: Copyright,
    title: "10. Reviews, Content & Intellectual Property",
    delay: 0.55,
    paragraphs: [
      "If customers submit reviews, ratings, comments, photographs, testimonials, or other content, they remain responsible for that content.",

      "Content submitted to Vault Skin must not be unlawful, fraudulent, defamatory, abusive, misleading, obscene, discriminatory, privacy-infringing, or otherwise violate another person's rights.",

      "By submitting content, customers grant Vault Skin a non-exclusive, royalty-free right to use, reproduce, display, and publish that content for legitimate business, marketing, customer-service, or website purposes, subject to applicable law.",

      "Vault Skin may remove or refuse content that violates these Terms or applicable law.",

      "Unless otherwise stated, Vault Skin's logos, branding, photographs, text, designs, videos, software, and other website content are owned by or licensed to Vault Skin. Such content may not be copied, modified, distributed, sold, or commercially exploited without permission, except where permitted by law.",
    ],
  },

  {
    id: "privacy-third-party-liability",
    icon: ShieldCheck,
    title: "11. Privacy, Third-Party Services & Liability",
    delay: 0.6,
    paragraphs: [
      "Your use of Vault Skin is also subject to our Privacy Policy, which explains how personal information is collected, used, protected, retained, and disclosed.",

      "Vault Skin may use third-party providers for payment processing, delivery, hosting, analytics, communications, advertising, authentication, and other business functions. Those providers may have their own terms and privacy policies.",

      "Vault Skin aims to keep the website available and functioning properly but does not guarantee uninterrupted, error-free, completely secure, or continuous availability.",

      "To the maximum extent permitted by applicable law, Vault Skin and its owners, employees, partners, service providers, and affiliates will not be responsible for indirect, incidental, special, or consequential losses arising from use of our website or services.",

      "Nothing in these Terms excludes or limits any consumer right, liability, warranty, or remedy that cannot legally be excluded or limited.",
    ],
  },

  {
    id: "changes-law-contact",
    icon: Scale,
    title: "12. Changes, Governing Law & Contact",
    delay: 0.65,
    paragraphs: [
      "Vault Skin may update these Terms & Conditions from time to time to reflect changes in our business, products, services, technology, legal requirements, or operating practices.",

      "Material changes may be communicated by updating the effective date or providing additional notice where appropriate. Continued use of our website after updated Terms become effective constitutes acceptance to the extent permitted by law.",

      "These Terms shall be interpreted and applied according to the applicable laws of Nepal, except where applicable law requires otherwise.",

      "If you have a question, complaint, concern, or dispute regarding an order, product, payment, delivery, return, refund, or website use, please contact Vault Skin first so we can attempt to resolve the matter.",
    ],
    listItems: [
      {
        bold: "Email:",
        text: " vaultskinco@gmail.com",
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
        text: "For any questions, concerns, or disputes, please contact us first through the channels above. We will review the matter and respond as soon as reasonably possible.",
      },
     
    ],
  },
];

