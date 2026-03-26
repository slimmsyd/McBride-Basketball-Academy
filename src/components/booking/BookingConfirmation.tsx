"use client";

import { useState, useEffect } from "react";
import type { BookingData } from "@/app/booking/page";
import { checkCalendarConnected } from "@/lib/actions";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export default function BookingConfirmation({ booking }: { booking: BookingData }) {
  const [emailConnected, setEmailConnected] = useState(false);
  useEffect(() => { checkCalendarConnected().then(setEmailConnected); }, []);

  const dateStr = `${DAY_NAMES[booking.date.getDay()]}, ${MONTH_NAMES[booking.date.getMonth()]} ${booking.date.getDate()}, ${booking.date.getFullYear()}`;

  return (
    <div className="max-w-xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center gap-8">
      {/* Step indicator — all complete */}
      <div className="flex items-center gap-3 mb-4">
        {["Session", "Details", "Payment", "Confirmed"].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-accent text-white">
              {i < 3 ? "✓" : "✓"}
            </div>
            <span className={`font-[family-name:var(--font-body)] text-sm font-medium hidden md:block ${i === 3 ? "text-primary" : "text-muted"}`}>{label}</span>
            {i < 3 && <div className="w-8 md:w-12 h-px bg-accent" />}
          </div>
        ))}
      </div>

      {/* Success icon */}
      <div className="w-[72px] h-[72px] bg-[#22C55E] rounded-full flex items-center justify-center">
        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="font-[family-name:var(--font-headline)] text-3xl md:text-[40px] font-extrabold text-primary text-center">
        YOU&apos;RE BOOKED!
      </h1>
      <p className="font-[family-name:var(--font-body)] text-[15px] text-secondary text-center">
        {emailConnected
          ? `A confirmation has been sent to ${booking.player?.parentEmail ?? "your email"}`
          : `Your booking is confirmed for ${booking.player?.parentEmail ?? "your email"}`}
      </p>

      {/* Confirmation card */}
      <div className="w-full bg-surface rounded-2xl p-7 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="font-[family-name:var(--font-mono)] text-[11px] font-medium text-muted tracking-[2px]">CONFIRMATION</span>
          <span className="font-[family-name:var(--font-mono)] text-xs font-semibold text-accent">{booking.confirmationNumber}</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex flex-col gap-2.5">
          {[
            { label: "Player", value: `${booking.player?.firstName} ${booking.player?.lastName}` },
            { label: "Session", value: booking.session?.name },
            { label: "Date", value: dateStr },
            { label: "Time", value: booking.session?.time },
          ].map((row) => (
            <div key={row.label} className="flex justify-between">
              <span className="font-[family-name:var(--font-body)] text-[13px] font-medium text-muted">{row.label}</span>
              <span className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-primary text-right">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full flex gap-3">
        <a
          href="#"
          className="flex-1 h-11 flex items-center justify-center gap-2 bg-white rounded-lg border border-border font-[family-name:var(--font-body)] text-sm font-semibold text-secondary hover:bg-surface transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          Add to Calendar
        </a>
        <a
          href="/booking"
          className="flex-1 h-11 flex items-center justify-center bg-accent rounded-lg font-[family-name:var(--font-body)] text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
        >
          Book Another Session
        </a>
      </div>

      <a
        href="/"
        className="font-[family-name:var(--font-body)] text-sm font-medium text-muted underline hover:text-secondary transition-colors"
      >
        Back to Home
      </a>
    </div>
  );
}
