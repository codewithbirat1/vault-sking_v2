"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileCheck } from "lucide-react";
import { termsData } from "@/data/termsData";
import { LegalHeader } from "./LegalHeader";
import { LegalSection } from "./LegalSection";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TermsDialog({ children, open, onOpenChange }: TermsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };
  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger>{children}</DialogTrigger>}
      <DialogContent
        showCloseButton={false}
        className="max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-bg border-border rounded-2xl shadow-xl sm:rounded-2xl"
      >
        <LegalHeader
          icon={FileCheck}
          title="Terms & Conditions"
          subtitle="Please read these terms carefully before using our website."
        />

        <ScrollArea className="flex-1 px-6 py-8 h-full">
          <div className="flex flex-col gap-6 w-full mx-auto pb-6">
            {termsData.map((section) => (
              <LegalSection
                key={section.id}
                icon={section.icon}
                title={section.title}
                delay={section.delay}
              >
                {section.paragraphs.map((p, index) => (
                  <p key={index}>{p}</p>
                ))}
                {section.listItems && (
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    {section.listItems.map((item, idx) => (
                      <li key={idx}>
                        {item.bold && <strong className="text-text">{item.bold}</strong>}
                        {item.text}
                      </li>
                    ))}
                  </ul>
                )}
              </LegalSection>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
