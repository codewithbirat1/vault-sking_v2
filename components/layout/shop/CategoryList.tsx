import type { Category } from "@/data/products";
import React, { useState } from "react";
import Title from "../Products/Title";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";
import { getSlugValue } from "@/utils/categoryHelper";

interface Props {
  categories: Category[];
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const CategoryList = ({
  categories,
  selectedCategories,
  setSelectedCategories,
}: Props) => {
  const [showAll, setShowAll] = useState(false);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const visibleCategories = showAll ? categories : categories?.slice(0, 5);

  return (
    <div className="w-full py-3 border-b border-border/20 last:border-none">      <Title className="text-sm font-semibold text-zinc-900 mb-2">Product Categories</Title>
      <div className="space-y-1">
        {visibleCategories?.map((category) => {
          const slug = getSlugValue(category?.slug);
          if (!slug) return null;
          const isChecked = selectedCategories.includes(slug);
          return (
            <div
              key={category?._id}
              className="flex items-center gap-2 h-8 px-1 rounded-md hover:bg-muted/40 cursor-pointer transition-colors"           >
              <Checkbox
                checked={isChecked}
                id={`cat-${slug}`}
                onCheckedChange={() => toggleCategory(slug)}
              />
              <Label
                htmlFor={`cat-${slug}`}
                className={`flex-1 cursor-pointer text-sm leading-none transition-colors ${isChecked
                  ? "font-semibold text-zinc-900"
                  : "font-medium text-zinc-600"
                  } group-hover:text-primary flex-1 py-2`}
              >
                {category?.title}
              </Label>
            </div>
          );
        })}
      </div>

      {categories?.length > 5 && (
        <button type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-semibold mt-3 text-primary/80 hover:text-primary hoverEffect cursor-pointer flex items-center gap-1 py-1"
        >
          {showAll ? "Show Less ▲" : `Show More (+${categories.length - 5}) ▼`}
        </button>
      )}

      {selectedCategories.length > 0 && (
        <button type="button"
          onClick={() => setSelectedCategories([])}
          className="text-xs font-medium mt-3 block text-primary underline underline-offset-2 hover:text-accent hoverEffect"
        >
          Clear categories
        </button>
      )}
    </div>
  );
};

export default CategoryList;