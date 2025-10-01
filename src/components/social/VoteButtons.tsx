"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { ThumbsUp, ThumbsDown, AlertCircle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface VoteButtonsProps {
  articleId: string;
  initialVotes?: {
    upvotes: number;
    downvotes: number;
  };
  className?: string;
  onVote?: (type: "up" | "down", articleId: string) => Promise<void>;
  onReport?: (reason: string, articleId: string) => Promise<void>;
}

export function VoteButtons({
  articleId,
  initialVotes = { upvotes: 0, downvotes: 0 },
  className = "",
  onVote,
  onReport,
}: VoteButtonsProps) {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (type: "up" | "down") => {
    if (!session) {
      toast({
        title: "Login required",
        description: "Please login to vote on articles.",
        variant: "default",
      });
      return;
    }

    try {
      // If user is changing their vote
      if (userVote) {
        if (userVote === type) {
          // Remove vote
          setVotes((prev) => ({
            ...prev,
            [`${type}votes`]: prev[`${type}votes`] - 1,
          }));
          setUserVote(null);
        } else {
          // Change vote
          setVotes((prev) => ({
            upvotes: prev.upvotes + (type === "up" ? 1 : -1),
            downvotes: prev.downvotes + (type === "down" ? 1 : -1),
          }));
          setUserVote(type);
        }
      } else {
        // New vote
        setVotes((prev) => ({
          ...prev,
          [`${type}votes`]: prev[`${type}votes`] + 1,
        }));
        setUserVote(type);
      }

      onVote?.(type, articleId);
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReport = async () => {
    if (!session) {
      toast({
        title: "Login required",
        description: "Please login to report articles.",
        variant: "default",
      });
      return;
    }

    if (!reportReason.trim()) {
      toast({
        title: "Report reason required",
        description: "Please provide a reason for reporting this article.",
        variant: "default",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onReport?.(reportReason, articleId);
      setIsReportModalOpen(false);
      setReportReason("");
      toast({
        title: "Report submitted",
        description: "Thank you for helping maintain content quality.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error reporting:", error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Upvote */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("up")}
        className={`flex items-center gap-1 ${
          userVote === "up" ? "text-green-600 dark:text-green-400" : ""
        }`}
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="text-sm">{votes.upvotes}</span>
      </Button>

      {/* Downvote */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("down")}
        className={`flex items-center gap-1 ${
          userVote === "down" ? "text-red-600 dark:text-red-400" : ""
        }`}
      >
        <ThumbsDown className="h-4 w-4" />
        <span className="text-sm">{votes.downvotes}</span>
      </Button>

      {/* Report Dialog */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for reporting</Label>
              <Textarea
                id="reason"
                placeholder="Please describe why you're reporting this article..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsReportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReport}
                disabled={isSubmitting || !reportReason.trim()}
              >
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
