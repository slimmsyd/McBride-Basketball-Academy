import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="about" className="py-12 px-6 md:py-20 md:px-20">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-7xl mx-auto">
        <div className="w-full md:w-[500px] h-[350px] md:h-[600px] relative md:flex-shrink-0 rounded-2xl overflow-hidden">
          <Image
            src="/assets/isaac-portrait.jpg"
            alt="Isaac McBride - #10 jersey with basketball"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-6 md:gap-8">
          <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-accent tracking-[3px]">
            ABOUT
          </span>
          <h2 className="font-[family-name:var(--font-headline)] text-3xl md:text-5xl font-extrabold text-primary leading-tight">
            TRAIN WITH THE BEST
          </h2>
          <p className="font-[family-name:var(--font-body)] text-sm md:text-base text-secondary leading-relaxed">
            Isaac McBride is a former Division I basketball player turned elite
            trainer. With years of competitive experience and a passion for
            developing young athletes, Isaac brings intensity, discipline, and
            proven methodology to every session. His training focuses on
            fundamentals, basketball IQ, and the mental toughness needed to
            compete at the highest level.
          </p>
          <div className="flex gap-6 md:gap-8 mt-2 md:mt-4">
            {[
              { value: "10+", label: "YEARS EXPERIENCE" },
              { value: "500+", label: "ATHLETES TRAINED" },
              { value: "D1", label: "COLLEGE ATHLETE" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-[family-name:var(--font-headline)] text-2xl md:text-4xl font-extrabold text-accent">
                  {stat.value}
                </span>
                <span className="font-[family-name:var(--font-body)] text-[10px] md:text-xs font-semibold text-muted tracking-wide">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
