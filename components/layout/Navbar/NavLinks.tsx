"use client";
import Link from "next/link";
import { navData, categoriesData } from "@/constants/data";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

const NavLinks = () => {
  const pathname = usePathname();
  
  return (
    <div className="hidden md:inline-flex w-1/3 font-semibold items-center gap-6 text-text text-sm capitalize">
      {navData?.map((item) => {
        if (item.isDropdown) {
          return (
            <div key={item.title} className="relative group cursor-pointer py-4">
              <div className="flex items-center gap-1 hover:text-accent hoverEffect">
                {item.title}
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-180" />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[400px] bg-white border border-border shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[1001]">
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {categoriesData.map((category) => (
                      <Link
                        key={category.title}
                        href={`/category/${category.href}`}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors group/link"
                      >
                        <div className="w-2 h-2 rounded-full bg-border group-hover/link:bg-accent transition-colors" />
                        <span className="font-medium">{category.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item?.title}
            href={item?.href as string}
            className={`hover:text-accent hoverEffect relative group py-4 ${pathname === item?.href && "text-accent"}`}
          >
            {item?.title}
            <span className={`absolute bottom-3 left-0 w-full h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300
              ${pathname === item?.href && "scale-x-100"}`} />
          </Link>
        );
      })}
    </div>
  );
};

export default NavLinks;
