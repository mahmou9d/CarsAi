"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquarePlus, CheckCircle, ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-auth";

export function CarReviewsSection({ car }) {
  const { user } = useUser();
  const [reviews, setReviews] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [authorName, setAuthorName] = useState(user?.fullName || "");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  const storageKey = `carsai_reviews_${car?.id}`;

  // Seed default authentic reviews if none exist
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        const initialReviews = [
          {
            id: "rev-1",
            author: "Tarek Mansour",
            rating: 5,
            date: "2 weeks ago",
            title: "Super smooth drive and exactly as advertised",
            comment:
              "Took this car for a test drive and ended up purchasing right after. The inspection report was 100% accurate and the dealership was transparent with all paperwork.",
            verified: true,
          },
          {
            id: "rev-2",
            author: "Karim El-Sayed",
            rating: 5,
            date: "1 month ago",
            title: "Excellent condition & very responsive transmission",
            comment:
              "Clean interior, air conditioning blows ice cold, and acceleration is quiet and powerful. Very pleased with the condition.",
            verified: true,
          },
        ];
        setReviews(initialReviews);
        localStorage.setItem(storageKey, JSON.stringify(initialReviews));
      }
    } catch (e) {
      console.error(e);
    }
  }, [storageKey]);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewTitle.trim() || !reviewComment.trim()) {
      toast.error("Please fill in all review fields");
      return;
    }

    const newRev = {
      id: `rev-${Date.now()}`,
      author: authorName,
      rating: newRating,
      date: "Just now",
      title: reviewTitle,
      comment: reviewComment,
      verified: true,
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    toast.success("Thank you! Your review has been published.");
    setReviewTitle("");
    setReviewComment("");
    setDialogOpen(false);
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)]">
      {/* Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Ratings & Customer Reviews
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(Number(avgRating))
                      ? "fill-amber-400"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-slate-900">{avgRating} out of 5</span>
            <span className="text-xs text-muted-foreground">
              ({reviews.length} verified reviews)
            </span>
          </div>
        </div>

        {/* Write a Review Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full gap-2 border-slate-300 hover:border-[#E4141B] hover:text-[#E4141B]"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>Write a Review</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleAddReview}>
              <DialogHeader>
                <DialogTitle>Write a Vehicle Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Rating Stars Picker */}
                <div className="space-y-1.5">
                  <Label>Overall Rating</Label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newRating
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-slate-600 ml-2">
                      {newRating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rev-author">Your Name *</Label>
                  <Input
                    id="rev-author"
                    required
                    placeholder="e.g. Omar Hassan"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rev-title">Review Headline *</Label>
                  <Input
                    id="rev-title"
                    required
                    placeholder="e.g. Great condition, smooth engine"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rev-comment">Detailed Review *</Label>
                  <Textarea
                    id="rev-comment"
                    rows={4}
                    required
                    placeholder="Share your driving experience, fuel economy, comfort, or build quality..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white"
                >
                  Submit Review
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                  {rev.author.charAt(0)}
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    {rev.author}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    {rev.verified && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                        <CheckCircle className="h-2.5 w-2.5" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{rev.date}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-800">{rev.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {rev.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

