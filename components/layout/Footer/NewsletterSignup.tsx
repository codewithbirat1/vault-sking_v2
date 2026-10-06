"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NewsletterSignup = () => {
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSending) return;

    setIsSending(true);
    const toastId = toast.loading("Sending your subscription...", {
      duration: Infinity,
    });

    await new Promise((resolve) => window.setTimeout(resolve, 1000));

    toast.dismiss(toastId);
    toast("Subscription was sent.");
    setIsSending(false);
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input
        name="email"
        placeholder="Enter your email"
        type="email"
        required
        disabled={isSending}
      />
      <Button className="w-full" type="submit" disabled={isSending}>
        {isSending ? "Sending..." : "Subscribe"}
      </Button>
    </form>
  );
};

export default NewsletterSignup;
