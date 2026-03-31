const HS_ACCOLADES = [
  "Gatorade Player of the Year",
  "Division 1 Commit (University of Kansas) — only one in school history",
  "2,896 Career Points",
  "3x State Champion",
  "45 Division 1 Offers, 15 High Major",
];

const COLLEGE_ACCOLADES = [
  "March Madness Appearance",
  "2,065 Career Points",
  "Lou Henson Award Finalist",
  "Pre-Season Player of the Year",
  "3x All Summit League",
  "Top 10 in Scoring (ORU)",
  "Top 5 in FT%",
  "6th All-Time in 3pt's Made (252)",
  "National Player of the Week",
  "Career High: 44 Points",
  "Back-to-Back Years in Top 35 PPG Nationally",
];

function AccoladeGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-[family-name:var(--font-headline)] text-lg md:text-xl font-bold text-accent tracking-wide">
        {title}
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
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
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16 max-w-7xl mx-auto">
        <div className="w-full md:w-[500px] h-[350px] md:h-[600px] relative md:flex-shrink-0 rounded-2xl overflow-hidden md:sticky md:top-24 md:self-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/isaac-court.jpg"
            alt="Isaac McBride - #10 on court at ORU"
            className="w-full h-full object-cover object-top"
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
            MBA is an environment where your student-athlete can grow in their
            skills on the basketball floor. At MBA, you will get full devotion
            and effort from someone who has been where your athlete wants to go.
            In the Academy, your athlete will learn quality, TRANSLATABLE skills.
            A hands-on, hard-working culture that will ensure growth on and off
            the floor. Scoring, playmaking, ball-handling, defense, and mentality
            are some of the attributes that will be drilled/taught.
          </p>

          {/* Accolades */}
          <div className="flex flex-col gap-6 mt-2">
            <AccoladeGroup title="HIGH SCHOOL" items={HS_ACCOLADES} />
            <AccoladeGroup title="COLLEGE" items={COLLEGE_ACCOLADES} />
          </div>

          {/* Personal Statement */}
          <div className="mt-2 p-5 md:p-6 bg-surface rounded-2xl border border-border">
            <p className="font-[family-name:var(--font-body)] text-sm md:text-base text-secondary leading-relaxed italic">
              &ldquo;I am not the basketball guru or sensei. I am someone who
              has been blessed by God to have a gift. I took the gift and
              stewarded it well through countless hours of hard work. MBA will be
              an environment where your athlete can cultivate and mold their
              passion for the game. They will have the opportunity to sharpen
              their skills and a chance to steward their gifts on the basketball
              floor. I believe from experience, I have a pretty good idea of how
              to get better. A good idea of how to improve. Thank you, God
              Bless.&rdquo;
            </p>
            <span className="font-[family-name:var(--font-headline)] text-sm font-bold text-primary mt-3 block">
              &mdash; Issac McBride
            </span>
          </div>

          {/* Schedule */}
          <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl border border-accent/20">
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
