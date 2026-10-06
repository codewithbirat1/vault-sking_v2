import React from "react";
import Title from "../Products/Title";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";

const concernArray = [
  { title: "Acne", value: "acne" },
  { title: "Dryness", value: "dryness" },
  { title: "Pigmentation", value: "pigmentation" },
  { title: "Anti Aging", value: "anti-aging" },
];

interface Props {
  selectedSkinConcerns: string[];
  setSelectedSkinConcerns: React.Dispatch<React.SetStateAction<string[]>>;
}

const SkinConcernList = ({
  selectedSkinConcerns,
  setSelectedSkinConcerns,
}: Props) => {
  const toggleConcern = (value: string) => {
    setSelectedSkinConcerns((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
<div className="w-full py-3 border-b border-border/20 last:border-none">    
  <Title className="text-sm font-semibold text-zinc-900 mb-2">Skin Concerns</Title>
      <div className="space-y-0.5">
        {concernArray?.map((concern) => {
          const isChecked = selectedSkinConcerns.includes(concern.value);
          return (
            <div
              key={concern.value}
className="flex items-center gap-2 h-8 px-1 rounded-md hover:bg-muted/40 cursor-pointer transition-colors"            >
              <Checkbox
                checked={isChecked}
                id={`concern-${concern.value}`}
                onCheckedChange={() => toggleConcern(concern.value)}
              />
              <Label
                htmlFor={`concern-${concern.value}`}
                className={`cursor-pointer text-sm transition-colors duration-150 ${
                  isChecked ? "font-semibold text-primary" : "font-normal text-text"
                } group-hover:text-primary flex-1 py-2`}
              >
                {concern.title}
              </Label>
            </div>
          );
        })}
      </div>
      {selectedSkinConcerns.length > 0 && (
        <button type="button"
          onClick={() => setSelectedSkinConcerns([])}
          className="text-xs font-medium mt-3 block text-primary underline underline-offset-2 hover:text-accent hoverEffect"
        >
          Clear skin concerns
        </button>
      )}
    </div>
  );
};

export default SkinConcernList;
