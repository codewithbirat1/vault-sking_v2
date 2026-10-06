"use client";

import React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Container from "@/components/Container";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import WishList from "./WishList";
import SignIn from "../../auth/SignIn";
import MobileMenu from "./MobileMenu";
import OrdersButton from "./OrdersButton";

const Navbar = () => {
  const navRef = useRef<HTMLElement>(null);
  const naturalTopRef = useRef(0);
  const isFixedRef = useRef(false);
  const [isFixed, setIsFixed] = useState(false);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    naturalTopRef.current = nav.getBoundingClientRect().top + window.scrollY;

    const updateHeaderOffset = () => {
      const headerBottom = nav.getBoundingClientRect().bottom;
      document.documentElement.style.setProperty(
        "--header-h",
        `${Math.max(headerBottom, 0)}px`,
      );
    };

    const updatePosition = () => {
      if (document.body.style.position === "fixed") return;

      const shouldBeFixed = window.scrollY >= naturalTopRef.current;
      isFixedRef.current = shouldBeFixed;
      setIsFixed(shouldBeFixed);
      setNavHeight(nav.offsetHeight);
      updateHeaderOffset();
    };

    const updateNaturalTop = () => {
      if (!isFixedRef.current) {
        naturalTopRef.current =
          nav.getBoundingClientRect().top + window.scrollY;
      }
      updatePosition();
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updateNaturalTop);
    window.addEventListener("load", updateHeaderOffset);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updateNaturalTop);
      window.removeEventListener("load", updateHeaderOffset);
    };
  }, []);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateHeaderOffset = () => {
      const headerBottom = nav.getBoundingClientRect().bottom;
      document.documentElement.style.setProperty(
        "--header-h",
        `${Math.max(headerBottom, 0)}px`,
      );
    };

    updateHeaderOffset();
    const headerObserver = new ResizeObserver(updateHeaderOffset);
    headerObserver.observe(nav);
    if (nav.previousElementSibling instanceof HTMLElement) {
      headerObserver.observe(nav.previousElementSibling);
    }

    return () => headerObserver.disconnect();
  }, [isFixed]);

  return (
    <>
      <nav
        ref={navRef}
        className={`${isFixed ? "fixed inset-x-0 top-0" : "relative w-full"} z-[1000] bg-bg/60 border-b border-border/50 backdrop-blur-lg supports-backdrop-filter:bg-bg/60`}
      >
        <Container className="flex items-center justify-between text-text py-4 overflow-x-clip overflow-y-visible">
          {/* Left */}
          <div className="w-auto md:w-1/3 flex items-center gap-0.5 justify-start md:gap-0">
            <MobileMenu />
            <Logo />
          </div>

          {/* Center */}
          <NavLinks />

          {/* Right */}
          <div className="w-auto md:w-1/3 flex items-center justify-end gap-4">
            <SearchBar />
            <CartIcon />
            <WishList />
            <OrdersButton />
            <SignIn />
          </div>
        </Container>
      </nav>
      {isFixed && <div aria-hidden="true" style={{ height: navHeight }} />}
    </>
  );
};

export default Navbar;
