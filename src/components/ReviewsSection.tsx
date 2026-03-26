import { getReviews } from "@/lib/actions";
import ReviewsCarousel from "./ReviewsCarousel";

export default async function ReviewsSection() {
  const reviews = await getReviews();

  const reviewData = reviews.map((r) => ({
    stars: r.stars,
    quote: r.quote,
    name: r.reviewerName,
    role: r.reviewerRole,
  }));

  return (
    <section id="reviews" className="py-12 px-6 md:py-20 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-2 mb-8 md:mb-12">
          <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-accent tracking-[3px]">
            TESTIMONIALS
          </span>
          <h2 className="font-[family-name:var(--font-headline)] text-3xl md:text-5xl font-extrabold text-primary text-center">
            WHAT THEY SAY
          </h2>
        </div>
        <ReviewsCarousel reviews={reviewData} />
      </div>
    </section>
  );
}
