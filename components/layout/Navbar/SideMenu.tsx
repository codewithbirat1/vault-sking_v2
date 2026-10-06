import React, { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useOutsideClick } from "@/hooks";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { navData, categoriesData } from "@/constants/data";
import SocialMedia from "@/components/layout/Navbar/SocialMedia";

const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClose);
  const portalReady = useSyncExternalStore(
    subscribeToMount,
    getClientSnapshot,
    getServerSnapshot,
  );

  return (
    portalReady
      ? createPortal(
      <div
        className={`fixed inset-y-0 left-0 z-1001 w-full bg-black/50 shadow-xl md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"} hoverEffect`}
      >
        <div
          ref={sidebarRef}
          className="min-w-72 max-w-96 bg-black h-screen border-r border-r-accent p-10 flex-col gap-6"
        >
          <div className="flex items-center justify-between gap-5">
            <button
              type="button"
              className="text-white hover:text-accent hoverEffect"
              onClick={onClose}
            >
              <X />
            </button>
          </div>

          <div className="flex flex-col space-y-4 font-semibold text-lg text-white mt-10">
            {navData?.map((item) => {
              if (item.isDropdown) {
                return (
                  <div key={item.title} className="flex flex-col space-y-3">
                    <span className="text-white opacity-50 uppercase text-sm tracking-wider mt-4">
                      {item.title}
                    </span>
                    <div className="flex flex-col space-y-3 pl-4 border-l border-white/20">
                      {categoriesData.map((cat) => (
                        <a
                          key={cat.title}
                          href={`/category/${cat.href}`}
                          className="text-white hover:text-accent transition-colors text-base"
                        >
                          {cat.title}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <a
                  key={item.title}
                  href={item.href as string}
                  className={`text-white hover:text-accent hoverEffect ${
                    pathname === item.href && "text-accent"
                  }`}
                >
                  {item.title}
                </a>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-5 border-t border-t-accent pt-5">
            <SocialMedia />
          </div>
        </div>
      </div>,
      document.body,
    )
      : null
  );
};

export default SideMenu;
