"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, KeyRound } from "lucide-react";

const CREDENTIALS = {
  email: "mah90moud9@gmail.com",
  password: "QWEqwe123!@#",
};

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="shrink-0 h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700"
        onClick={handleCopy}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </Button>
    </div>
  );
}

export function DemoCredentialsModal() {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <KeyRound className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">Try the demo</DialogTitle>
          <DialogDescription className="text-center">
            Use these credentials to sign in and explore the app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <CopyRow label="Email" value={CREDENTIALS.email} />
          <CopyRow label="Password" value={CREDENTIALS.password} />
        </div>

        <Button
          onClick={() => setOpen(false)}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
}
