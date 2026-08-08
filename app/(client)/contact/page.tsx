"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SocialMedia from "@/components/layout/Footer/SocialMedia";

const WHATSAPP_NUMBER = "9779840320862"; // E.164 without leading +

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.07a8.16 8.16 0 004.77 1.52V7.14a4.85 4.85 0 01-1-.45z" />
  </svg>
);

interface ContactItemProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

const ContactItem = ({ icon, label, children }: ContactItemProps) => (
  <div className="flex items-start gap-4 group">
    <div className="shrink-0 w-12 h-12 rounded-xl bg-bg border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
      {icon}
     </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">
        {label}
      </p>
      <div className="text-text text-[15px] leading-relaxed font-medium">
        {children}
      </div>
    </div>
  </div>
);



export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const text =
      `New Skincare Inquiry (Vault Enterprises)\n\n` +
      `Name: ${formData.name}\n` +
      `Phone: ${formData.phone}\n` +
      `Subject: ${formData.subject}\n` +
      `Message: ${formData.message}`;

    // Encode and open WhatsApp — works for both mobile app and WhatsApp Web
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Show success state, then reset
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="bg-bg min-h-screen">

      <div className="relative max-w-7xl mx-auto px-6 py-6 md:py-12">
        
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-start">
          
          {/* LEFT — Contact Info */}
          <div className="flex flex-col gap-3">
            <div className="space-y-1 max-w-lg">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Get in Touch
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-text leading-tight tracking-tight">
                Let&apos;s discuss your skincare journey
              </h2>
            </div>

            <div className="bg-surface rounded-2xl p-8 border border-border shadow-sm flex flex-col gap-8">
              <ContactItem icon={<Phone className="w-5 h-5" />} label="Phone & WhatsApp">
                <a
                  href="tel:+9779840320862"
                  className="hover:text-accent transition-colors"
                >
                  +977 9840320862
                </a>
              </ContactItem>
              
              <ContactItem icon={<Mail className="w-5 h-5" />} label="Email">
                <a
                  href="mailto:support@vault-enterprises.com"
                  className="hover:text-accent transition-colors break-all"
                >
                  support@vaultskin.com
                </a>
              </ContactItem>

              <ContactItem icon={<MapPin className="w-5 h-5" />} label="Headquarters">
                <p>NBTC, Kathmandu, Nepal</p>
              </ContactItem>

              <div className="pt-4 border-t border-border">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">
                  Follow Us
                </p>
                <div className="flex items-center gap-3">
                  <SocialMedia />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Contact Form */}
          <div className="bg-surface rounded-2xl p-8 md:p-10 border border-border shadow-sm">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-text tracking-tight mb-2">
                Send a Message
              </h3>
              <p className="text-text-muted">
                Fill out the form below and it will open directly in WhatsApp for an instant connection with our team.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-text">Full Name</label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-bg border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-text">Phone Number</label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+977 9840320862"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="bg-bg border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-text">Subject</label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Order Inquiry / Product Question"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="bg-bg border-border"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-text">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="How can we help you today?"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitted}
                className="w-full sm:w-auto min-w-[200px] h-12 text-base font-semibold"
              >
                {submitted ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Opening WhatsApp...
                  </>
                ) : (
                  <>
                    <WhatsAppIcon />
                    <span className="ml-2">Chat on WhatsApp</span>
                  </>
                )}
              </Button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}