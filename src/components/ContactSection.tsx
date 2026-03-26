export default function ContactSection() {
  return (
    <section id="contact" className="py-12 px-6 md:py-16 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          <div className="flex-1 flex flex-col gap-5">
            <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-accent tracking-[3px]">
              GET IN TOUCH
            </span>
            <h2 className="font-[family-name:var(--font-headline)] text-3xl md:text-4xl font-extrabold text-primary">
              CONTACT
            </h2>
            <div className="flex flex-col gap-1.5">
              <label className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-secondary">
                Name
              </label>
              <input
                type="text"
                placeholder="Your full name"
                className="w-full h-12 px-4 bg-surface rounded-lg border border-border text-sm font-[family-name:var(--font-body)] text-primary placeholder:text-muted outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-secondary">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full h-12 px-4 bg-surface rounded-lg border border-border text-sm font-[family-name:var(--font-body)] text-primary placeholder:text-muted outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-secondary">
                Message
              </label>
              <textarea
                placeholder="Tell us about your training goals..."
                rows={4}
                className="w-full px-4 py-3 bg-surface rounded-lg border border-border text-sm font-[family-name:var(--font-body)] text-primary placeholder:text-muted outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
            <button className="w-full h-12 bg-accent text-white font-[family-name:var(--font-headline)] text-base font-bold tracking-wide rounded-lg hover:bg-accent/90 transition-colors">
              SEND MESSAGE
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-[family-name:var(--font-headline)] text-xl md:text-2xl font-extrabold text-primary tracking-wide">
                ISAAC McBRIDE
              </span>
              <span className="font-[family-name:var(--font-body)] text-sm md:text-[15px] text-secondary">
                Elite Basketball Training
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-muted tracking-[2px]">
                FOLLOW
              </span>
              <a
                href="https://instagram.com/issac5mcbride"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface rounded-lg border border-border w-fit hover:bg-elevated transition-colors"
              >
                <svg
                  className="w-[18px] h-[18px] text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                </svg>
                <span className="font-[family-name:var(--font-body)] text-[13px] font-medium text-primary">
                  @issac5mcbride
                </span>
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-muted tracking-[2px]">
                CONTACT
              </span>
              <div className="flex items-center gap-2 text-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="font-[family-name:var(--font-body)] text-sm">
                  isaac@mcbridetraining.com
                </span>
              </div>
              <div className="flex items-center gap-2 text-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="font-[family-name:var(--font-body)] text-sm">
                  (555) 123-4567
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
