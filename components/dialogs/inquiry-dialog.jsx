"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";
import { submitCarInquiry } from "@/actions/cars";
import { useUser } from "@/hooks/use-auth";

export function InquiryDialog({ car, triggerButton }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: "",
    preferredContact: "EMAIL",
    message: car
      ? `Hi, I am interested in this ${car.year} ${car.make} ${car.model}. Please provide me with more details and current availability.`
      : "Hi, I have a question regarding vehicle availability.",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in your name, email, and message");
      return;
    }

    setLoading(true);
    try {
      const res = await submitCarInquiry({
        carId: car?.id,
        ...formData,
      });

      if (res.success) {
        setSubmitted(true);
        toast.success(res.message);
      } else {
        toast.error(res.error || "Failed to submit inquiry");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => setSubmitted(false), 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="w-full rounded-full gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Request Info</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Inquiry Sent!</DialogTitle>
              <DialogDescription className="text-center text-sm">
                Thank you, {formData.name}. Our dealership team has received your message regarding the {car?.year} {car?.make} {car?.model} and will contact you via {formData.preferredContact.toLowerCase()} shortly.
              </DialogDescription>
            </DialogHeader>
            <Button
              className="rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white px-6 mt-4"
              onClick={() => handleOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl">
                Inquire About {car ? `${car.year} ${car.make} ${car.model}` : "Vehicle"}
              </DialogTitle>
              <DialogDescription>
                Ask a question, request additional inspection details, or arrange special terms.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-name">Full Name *</Label>
                  <Input
                    id="inquiry-name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-email">Email Address *</Label>
                  <Input
                    id="inquiry-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-phone">Phone Number</Label>
                  <Input
                    id="inquiry-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +20 100 123 4567"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-pref">Preferred Contact</Label>
                  <Select
                    value={formData.preferredContact}
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, preferredContact: val }))
                    }
                  >
                    <SelectTrigger id="inquiry-pref">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="PHONE">Phone Call</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inquiry-message">Your Message *</Label>
                <Textarea
                  id="inquiry-message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what you'd like to know..."
                />
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Inquiry
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

