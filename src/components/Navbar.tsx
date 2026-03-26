"use client";

import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white h-16 md:h-20 flex items-center justify-between px-6 md:px-16">
      <a
        href="#"
        className="font-[family-name:var(--font-headline)] text-lg md:text-[22px] font-bold text-primary tracking-wide"
      >
        McBride Basketball Academy
      </a>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-8">
        {["ABOUT", "BOOKING"].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="font-[family-name:var(--font-body)] text-sm font-semibold text-secondary tracking-wide hover:text-primary transition-colors"
          >
            {link}
          </a>
        ))}
        <a
          href="#booking"
          className="bg-accent text-white font-[family-name:var(--font-body)] text-sm font-bold tracking-wide px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors"
        >
          BOOK NOW
        </a>
      </div>

      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
        aria-label="Toggle menu"
      >
        <span
          className={`block w-6 h-0.5 bg-primary transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`}
        />
        <span
          className={`block w-6 h-0.5 bg-primary transition-all duration-300 ${open ? "opacity-0" : ""}`}
        />
        <span
          className={`block w-6 h-0.5 bg-primary transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`}
        />
      </button>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 top-16 bg-white z-40 flex flex-col px-6 py-8 gap-2 transition-all duration-300 md:hidden ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        {["ABOUT", "BOOKING", "CONTACT"].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            onClick={() => setOpen(false)}
            className="font-[family-name:var(--font-body)] text-lg font-semibold text-primary tracking-wide py-4 border-b border-border"
          >
            {link}
          </a>
        ))}
        <a
          href="#booking"
          onClick={() => setOpen(false)}
          className="mt-4 bg-accent text-white font-[family-name:var(--font-body)] text-base font-bold tracking-wide px-6 py-4 rounded-lg text-center hover:bg-accent/90 transition-colors"
        >
          BOOK NOW
        </a>
      </div>
    </nav>
  );
}
