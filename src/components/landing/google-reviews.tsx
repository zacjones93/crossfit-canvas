"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Review {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface ReviewsData {
  reviews: Review[];
  rating: number;
  totalReviews: number;
}

export function GoogleReviews() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/google-reviews")
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            const error = errData as { error?: string };
            throw new Error(error.error || "Failed to fetch reviews");
          });
        }
        return res.json();
      })
      .then((data) => {
        const reviewData = data as ReviewsData & { error?: string };
        if (reviewData.error) {
          throw new Error(reviewData.error);
        }
        setData(reviewData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Reviews error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4" />
              <div className="h-4 bg-muted rounded w-96 mx-auto" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Members Say
            </h2>
            <p className="text-muted-foreground">
              Reviews are currently unavailable. Please check back soon!
            </p>
            {error && (
              <p className="text-xs text-destructive mt-2">
                Error: {error}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Members Say
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-6 h-6",
                    i < Math.floor(data.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-xl font-semibold">{data.rating}</span>
          </div>
          <p className="text-muted-foreground">
            Based on {data.totalReviews} Google reviews
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {data.reviews.slice(0, 6).map((review, index) => (
            <div
              key={index}
              className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                {review.profile_photo_url && (
                  <Image
                    src={review.profile_photo_url}
                    alt={review.author_name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full"
                    unoptimized
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {review.author_name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.relative_time_description}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-4">
                {review.text}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href={`https://search.google.com/local/reviews?placeid=${process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            Read all reviews on Google →
          </a>
        </div>
      </div>
    </section>
  );
}
