export default function Footer() {
  return (
    <footer className="px-6 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="h-px bg-border" />
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 py-6">
          <span className="font-[family-name:var(--font-body)] text-xs text-muted text-center md:text-left">
            &copy; 2026 Isaac McBride Basketball Training. All rights reserved.
            &nbsp;&middot;&nbsp; Powered by{" "}
            <a
              href="https://www.0ncode.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Oncode
            </a>
          </span>
          <div className="flex gap-6">
            <a
              href="#"
              className="font-[family-name:var(--font-body)] text-xs text-muted hover:text-secondary transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="font-[family-name:var(--font-body)] text-xs text-muted hover:text-secondary transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
