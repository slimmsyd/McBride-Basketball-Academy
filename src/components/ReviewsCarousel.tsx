"use client";

import { useState } from "react";

type Review = { stars: number; quote: string; name: string; role: string };

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 text-accent text-xl">
      {Array.from({ length: count }, (_, i) => (
        <span key={i}>&#9733;</span>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col gap-5 p-6 md:p-8 bg-surface rounded-3xl border border-border">
      <Stars count={review.stars} />
      <p className="font-[family-name:var(--font-body)] text-sm md:text-[15px] text-secondary leading-relaxed">
        &ldquo;{review.quote}&rdquo;
      </p>
      <div className="flex flex-col gap-0.5 mt-auto">
        <span className="font-[family-name:var(--font-headline)] text-base font-bold text-primary">
          {review.name}
        </span>
        <span className="font-[family-name:var(--font-body)] text-[13px] font-medium text-muted">
          {review.role}
        </span>
      </div>
    </div>
  );
}

export default function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      {/* Desktop: grid */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        {reviews.map((review) => (
          <ReviewCard key={review.name} review={review} />
        ))}
      </div>

      {/* Mobile: carousel */}
      <div className="md:hidden">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {reviews.map((review) => (
              <div key={review.name} className="w-full flex-shrink-0 px-1">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === activeIndex ? "bg-accent" : "bg-elevated"
              }`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
