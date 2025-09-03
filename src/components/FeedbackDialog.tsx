"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedbackDialog() {
  const [rating, setRating] = React.useState<number>(0);
  const [hover, setHover] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group gap-3">
          <MessageSquare className="text-green-600 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Feedback</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <DialogTitle>Feedback</DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="text-center mt-4">
          <span className="text-lg font-semibold mb-2">Rate your experience</span><br/>
          <span className="text-sm text-muted-foreground">
            Your input is valuable in helping us better understand your needs
            and tailor our service accordingly.
          </span>
        </DialogDescription>

        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              className="transition-transform transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-8 h-8",
                  (hover ?? rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            </button>
          ))}
        </div>

        <div className="text-center mt-2 text-sm font-medium">
          {rating > 0 ? `${rating} out of 5` : "No rating yet"}
        </div>

        {/* Comment box */}
        <div className="mt-6">
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none rounded-xl"
          />
        </div>

        {/* Submit */}
        <DialogFooter className="mt-6">
          <Button className="w-full bg-blue-600 ext-white rounded-xl p-6">
            Submit Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
