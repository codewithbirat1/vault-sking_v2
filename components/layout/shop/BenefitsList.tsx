import React from "react";
import Title from "../Products/Title";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";

const benefitArray = [
  { title: "Hydration", value: "hydration" },
  { title: "Brightening", value: "brightening" },
  { title: "Repair", value: "repair" },
];

interface Props {
  selectedBenefits: string[];
  setSelectedBenefits: React.Dispatch<React.SetStateAction<string[]>>;
}

const BenefitsList = ({
  selectedBenefits,
  setSelectedBenefits,
}: Props) => {
  const toggleBenefit = (value: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
<div className="w-full py-3 border-b border-border/20 last:border-none">   
   <Title className="text-sm font-semibold text-zinc-900 mb-2">Benefits</Title>
      <div className="space-y-0.5">
        {benefitArray?.map((benefit) => {
          const isChecked = selectedBenefits.includes(benefit.value);
          return (
            <div
              key={benefit.value}
className="flex items-center gap-2 h-8 px-1 rounded-md hover:bg-muted/40 cursor-pointer transition-colors"            >
              <Checkbox
                checked={isChecked}
                id={`benefit-${benefit.value}`}
                onCheckedChange={() => toggleBenefit(benefit.value)}
              />
              <Label
                htmlFor={`benefit-${benefit.value}`}
                className={`cursor-pointer text-sm transition-colors duration-150 ${
                  isChecked ? "font-semibold text-primary" : "font-normal text-text"
                } group-hover:text-primary flex-1 py-2`}
              >
                {benefit.title}
              </Label>
            </div>
          );
        })}
      </div>
      {selectedBenefits.length > 0 && (
        <button type="button"
          onClick={() => setSelectedBenefits([])}
          className="text-xs font-medium mt-3 block text-primary underline underline-offset-2 hover:text-accent hoverEffect"
        >
          Clear benefits
        </button>
      )}
    </div>
  );
};

export default BenefitsList;
