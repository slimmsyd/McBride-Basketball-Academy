const HS_ACCOLADES = [
  "Gatorade Player of the Year",
  "D1 Commit — University of Kansas",
  "2,896 Career Points",
  "3x State Champion",
  "45 D1 Offers, 15 High Major",
];

const COLLEGE_ACCOLADES = [
  "March Madness Appearance",
  "2,065 Career Points",
  "Lou Henson Award Finalist",
  "Pre-Season Player of the Year",
  "3x All Summit League",
  "National Player of the Week",
  "Career High: 44 Points",
  "6th All-Time in 3pt's Made (252)",
  "Back-to-Back Top 35 PPG Nationally",
];

function AccoladeGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="font-[family-name:var(--font-headline)] text-base font-bold text-accent tracking-wide">
        {title}
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="font-[family-name:var(--font-body)] text-sm text-secondary flex items-start gap-2"
          >
            <span className="text-accent mt-0.5">&#9733;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutSection() {
  return (
    <section id="about" className="py-12 px-6 md:py-20 md:px-20">
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-14 max-w-7xl mx-auto">
        <div className="w-full md:w-[440px] h-[320px] md:h-[540px] relative md:flex-shrink-0 rounded-2xl overflow-hidden md:sticky md:top-24 md:self-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/isaac-court.jpg"
            alt="Issac McBride - #10 on court at ORU"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="flex flex-col gap-5 md:gap-6">
          <div>
            <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-accent tracking-[3px]">
              ABOUT
            </span>
            <h2 className="font-[family-name:var(--font-headline)] text-3xl md:text-4xl font-extrabold text-primary leading-tight mt-2">
              TRAIN WITH THE BEST
            </h2>
          </div>

          <p className="font-[family-name:var(--font-body)] text-sm md:text-base text-secondary leading-relaxed">
            MBA is where student-athletes sharpen real, translatable skills. You get full devotion from someone who&apos;s been where your athlete wants to go &mdash; scoring, playmaking, ball-handling, defense, and the mentality to compete at the next level.
          </p>

          {/* Accolades */}
          <div className="flex flex-col gap-5">
            <AccoladeGroup title="HIGH SCHOOL" items={HS_ACCOLADES} />
            <AccoladeGroup title="COLLEGE (ORAL ROBERTS)" items={COLLEGE_ACCOLADES} />
          </div>

          {/* Personal Statement */}
          <div className="p-5 bg-surface rounded-xl border border-border">
            <p className="font-[family-name:var(--font-body)] text-sm text-secondary leading-relaxed italic">
              &ldquo;I&apos;m not the basketball guru. I&apos;m someone blessed by God with a gift, and I stewarded it through countless hours of hard work. MBA is where your athlete can cultivate their passion, sharpen their skills, and steward their gifts on the floor. I believe from experience, I have a pretty good idea of how to get better. Thank you, God Bless.&rdquo;
            </p>
            <span className="font-[family-name:var(--font-headline)] text-sm font-bold text-primary mt-2 block">
              &mdash; Issac McBride
            </span>
          </div>

          {/* Schedule */}
          <div className="flex items-center gap-3 p-3.5 bg-accent/5 rounded-xl border border-accent/20">
            <svg
              className="w-5 h-5 text-accent flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
            <span className="font-[family-name:var(--font-body)] text-sm font-semibold text-primary">
              Training Hours: Monday &ndash; Friday, 5:00 &ndash; 7:00 PM
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
