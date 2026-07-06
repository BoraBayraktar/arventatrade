"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CommunityActionLabels = {
  addReviewTitle: string;
  addQuestionTitle: string;
  ratingLabel: string;
  reviewTitleLabel: string;
  reviewCommentLabel: string;
  questionLabel: string;
  submitReview: string;
  submitQuestion: string;
  updateReview: string;
  deleteReview: string;
  submitSuccess: string;
  submitFailed: string;
  authRequired: string;
};

type OwnReview = {
  id: string;
  rating: number;
  title: string;
  comment: string;
};

type ProductCommunityActionsProps = {
  slug: string;
  labels: CommunityActionLabels;
};

export function ProductCommunityActions({ slug, labels }: ProductCommunityActionsProps) {
  const router = useRouter();

  const [reviewRating, setReviewRating] = useState("5");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [question, setQuestion] = useState("");

  const [loadingReview, setLoadingReview] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingOwnReview, setLoadingOwnReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ownReview, setOwnReview] = useState<OwnReview | null>(null);
  const ratingOptions = [1, 2, 3, 4, 5];

  useEffect(() => {
    let isMounted = true;

    async function loadOwnReview() {
      try {
        const response = await fetch(`/api/catalog/products/${slug}/reviews/me`);
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { item?: OwnReview | null };
        if (!isMounted || !payload.item) {
          return;
        }

        setOwnReview(payload.item);
        setReviewRating(String(payload.item.rating));
        setReviewTitle(payload.item.title);
        setReviewComment(payload.item.comment);
      } catch {
        // Ignore non-blocking own-review prefill failures.
      }
    }

    void loadOwnReview();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingReview(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        ownReview ? `/api/catalog/products/${slug}/reviews/me` : `/api/catalog/products/${slug}/reviews`,
        {
          method: ownReview ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: Number(reviewRating),
          title: reviewTitle,
          comment: reviewComment,
        }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(response.status === 401 ? labels.authRequired : (payload?.message ?? labels.submitFailed));
        return;
      }

      const payload = (await response.json()) as { item?: OwnReview };
      if (payload.item) {
        setOwnReview(payload.item);
      }

      if (!ownReview) {
        setReviewTitle("");
        setReviewComment("");
        setReviewRating("5");
      }
      setSuccess(labels.submitSuccess);
      router.refresh();
    } catch {
      setError(labels.submitFailed);
    } finally {
      setLoadingReview(false);
    }
  }

  async function submitQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingQuestion(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/catalog/products/${slug}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(response.status === 401 ? labels.authRequired : (payload?.message ?? labels.submitFailed));
        return;
      }

      setQuestion("");
      setSuccess(labels.submitSuccess);
      router.refresh();
    } catch {
      setError(labels.submitFailed);
    } finally {
      setLoadingQuestion(false);
    }
  }

  async function deleteOwnReview() {
    if (!ownReview) {
      return;
    }

    setLoadingOwnReview(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/catalog/products/${slug}/reviews/me`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(response.status === 401 ? labels.authRequired : (payload?.message ?? labels.submitFailed));
        return;
      }

      setOwnReview(null);
      setReviewTitle("");
      setReviewComment("");
      setReviewRating("5");
      setSuccess(labels.submitSuccess);
      router.refresh();
    } catch {
      setError(labels.submitFailed);
    } finally {
      setLoadingOwnReview(false);
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <form className="grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4" onSubmit={submitReview}>
        <h3 className="text-lg font-semibold text-neutral-950">{labels.addReviewTitle}</h3>
        <div className="grid gap-1">
          <Label>{labels.ratingLabel}</Label>
          <div className="flex items-center gap-2" role="radiogroup" aria-label={labels.ratingLabel}>
            {ratingOptions.map((rating) => {
              const isActive = Number(reviewRating) >= rating;

              return (
                <button
                  key={rating}
                  type="button"
                  aria-label={`${rating} yıldız`}
                  title={`${rating} yıldız`}
                  aria-pressed={Number(reviewRating) === rating}
                  onClick={() => setReviewRating(String(rating))}
                  className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <Star
                    className={isActive ? "h-7 w-7 fill-orange-500 text-orange-500" : "h-7 w-7 text-gray-300"}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-1">
          <Label>{labels.reviewTitleLabel}</Label>
          <Input value={reviewTitle} onChange={(event) => setReviewTitle(event.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>{labels.reviewCommentLabel}</Label>
          <Textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} required />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={loadingReview || loadingOwnReview}>
            {loadingReview ? "..." : (ownReview ? labels.updateReview : labels.submitReview)}
          </Button>
          {ownReview ? (
            <Button type="button" variant="destructive" disabled={loadingReview || loadingOwnReview} onClick={deleteOwnReview}>
              {loadingOwnReview ? "..." : labels.deleteReview}
            </Button>
          ) : null}
        </div>
      </form>

      <form className="grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4" onSubmit={submitQuestion}>
        <h3 className="text-lg font-semibold text-neutral-950">{labels.addQuestionTitle}</h3>
        <div className="grid gap-1">
          <Label>{labels.questionLabel}</Label>
          <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} required />
        </div>
        <Button type="submit" disabled={loadingQuestion}>
          {loadingQuestion ? "..." : labels.submitQuestion}
        </Button>
      </form>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 lg:col-span-2">{error}</p> : null}
      {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 lg:col-span-2">{success}</p> : null}
    </section>
  );
}
