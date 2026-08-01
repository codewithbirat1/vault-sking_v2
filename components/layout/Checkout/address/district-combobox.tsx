"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getDistrictsByProvince, type NepalDistrict } from "@/data/district"

interface DistrictComboboxProps {
  value: string;
  onChange: (value: string) => void;
  province?: string;
  id?: string;
}

const DistrictCombobox = ({
  value,
  onChange,
  province,
  id,
}: DistrictComboboxProps) => {
  const [open, setOpen] = useState(false);

  const districts: NepalDistrict[] = useMemo(
    () => getDistrictsByProvince(province),
    [province],
  );

  const selectedDistrict = districts.find((d) => d.value === value);

  return (
    <Popover  open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full justify-between font-normal"
            )}
          >
            {selectedDistrict ? selectedDistrict.label : "Select district"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        )}
      />
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 bg-white"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search district..." />
          <CommandList>
            <CommandEmpty>No district found.</CommandEmpty>
            <CommandGroup>
              {districts.map((district) => (
                <CommandItem
                  key={district.value}
                  value={district.label}
                  onSelect={() => {
                    onChange(district.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === district.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {district.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DistrictCombobox;