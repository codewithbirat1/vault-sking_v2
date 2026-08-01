import React from "react";
import Container from "@/components/Container";
import FooterTop from "./FooterTop";
import Logo from "@/components/layout/Navbar/Logo";
import SocialMedia from "@/components/layout/Footer/SocialMedia";
import { SubText, SubTitle } from "@/components/ui/text";
import { categoriesData, quickLinksData } from "@/constants/data";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PrivacyPolicyDialog } from "@/components/legal/PrivacyPolicyDialog";
import { TermsDialog } from "@/components/legal/TermsDialog";

const Footer = () => {
  return (
    <footer className="bg-bg border-t border-accent/90">
      <Container>
        <FooterTop />
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <SubText>
              Discover curated furniture collections at Shopcartyt, blending
              style and comfort to elevate your living spaces.
            </SubText>
            <SocialMedia
              className="text-primary/60"
              iconClassName="border-primary/60 hover:border-accent hover:text-accent"
              tooltipClassName="bg-primary text-white"
            />
          </div>
          <div>
            <SubTitle>Quick Links</SubTitle>
            <ul className="space-y-3 mt-4">
              {quickLinksData?.map((item) => {
                if (item?.title === "Terms & Conditions") {
                  return (
                    <li key={item?.title}>
                      <TermsDialog>
                        <span className="hover:text-accent hoverEffect font-medium text-left">
                          {item?.title}
                        </span>
                      </TermsDialog>
                    </li>
                  );
                }
                if (item?.title === "Privacy Policy") {
                  return (
                    <li key={item?.title}>
                      <PrivacyPolicyDialog>
                        <span className="hover:text-accent hoverEffect font-medium text-left">
                          {item?.title}
                        </span>
                      </PrivacyPolicyDialog>
                    </li>
                  );
                }
                return (
                  <li key={item?.title}>
                    <Link
                      href={item?.href}
                      className="hover:text-accent hoverEffect font-medium"
                    >
                      {item?.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <SubTitle>Categories</SubTitle>
            <ul className="space-y-3 mt-4">
              {categoriesData?.map((item) => (
                <li key={item?.title}>
                  <Link
                    href={`/category/${item?.href}`}
                    className="hover:text-accent hoverEffect font-medium"
                  >
                    {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <SubTitle>Newsletter</SubTitle>
            <SubText>
              Subscribe to our newsletter to receive updates and exclusive
              offers
            </SubText>
            <form className="space-y-3">
              <Input placeholder="Enter your email" type="email" required />
              <Button className="w-full">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className=" flex flex-row justify-between items-center py-5 text-lg border-t border-accent/90 text-center text-sm text-primary">
          <div className="flex flex-col items-center gap-2">
            <p>
              © {new Date().getFullYear()} Vault Enterprises Pvt. Ltd. All rights
              reserved.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p>
             Designed & Developed by <Link className="text-blue-600 underline cursor-pointer" href="https://www.nexolinx.com/">Nexo Linx Pvt Ltd</Link>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
