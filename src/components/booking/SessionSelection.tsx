"use client";

import { useState, useEffect } from "react";
import type { BookingData } from "@/app/booking/page";
import { getSessionsForDate } from "@/lib/actions";

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

type SessionData = {
  id: string;
  name: string;
  grade: string;
  displayTime: string;
  price: number;
  capacity: number;
  spotsRemaining: number;
};

function formatDate(date: Date) {
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function SessionSelection({
  booking,
  onSelect,
  onBack,
}: {
  booking: BookingData;
  onSelect: (date: Date, session: { id: string; name: string; grade: string; time: string; price: number }) => void;
  onBack: () => void;
}) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(booking.date);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSessionsForDate(selectedDate.toISOString())
      .then((data) => { setSessions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedDate]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSelected = (day: number) =>
    day === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <button onClick={onBack} className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-[family-name:var(--font-body)] text-sm font-medium">Back to Home</span>
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {["Session", "Details", "Payment", "Confirmed"].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-accent text-white" : "bg-surface text-muted"}`}>
              {i + 1}
            </div>
            <span className={`font-[family-name:var(--font-body)] text-sm font-medium hidden md:block ${i === 0 ? "text-primary" : "text-muted"}`}>{label}</span>
            {i < 3 && <div className="w-8 md:w-12 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 mb-8">
        <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-accent tracking-[2px]">
          {formatDate(selectedDate).toUpperCase()}
        </span>
        <h1 className="font-[family-name:var(--font-headline)] text-3xl md:text-4xl font-extrabold text-primary text-center">
          SELECT A SESSION
        </h1>
        <p className="font-[family-name:var(--font-body)] text-sm text-secondary">
          Choose from available sessions below
        </p>
      </div>

      {/* Mini calendar */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="font-[family-name:var(--font-headline)] text-base font-bold text-primary">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center bg-surface rounded-lg text-secondary hover:bg-elevated transition-colors text-sm">&larr;</button>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center bg-surface rounded-lg text-secondary hover:bg-elevated transition-colors text-sm">&rarr;</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="font-[family-name:var(--font-mono)] text-[10px] font-medium text-muted text-center py-1">{d}</div>
          ))}
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => day && setSelectedDate(new Date(viewYear, viewMonth, day))}
              className={`h-9 flex items-center justify-center text-xs font-medium rounded-md transition-colors ${
                day && isSelected(day) ? "bg-accent text-white font-bold"
                  : day && isToday(day) ? "text-accent font-bold ring-2 ring-accent/30"
                    : day ? "text-primary hover:bg-surface" : ""
              }`}
              disabled={!day}
            >{day}</button>
          ))}
        </div>
      </div>

      {/* Session cards */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="font-[family-name:var(--font-body)] text-sm text-muted py-8 text-center">No sessions available for this date.</p>
        ) : (
          sessions.map((session) => {
            const isFull = session.spotsRemaining <= 0;
            return (
              <div
                key={session.id}
                className={`flex flex-col gap-4 p-5 rounded-2xl border transition-all ${
                  isFull ? "bg-surface border-border opacity-60" : "bg-white border-border hover:border-accent/40 cursor-pointer"
                }`}
                onClick={() => !isFull && onSelect(selectedDate, { id: session.id, name: session.name, grade: session.grade, time: session.displayTime, price: session.price })}
              >
                <div className="flex justify-between items-center">
                  <span className="font-[family-name:var(--font-headline)] text-base md:text-lg font-bold text-primary">
                    {session.name}
                  </span>
                  <span className={`font-[family-name:var(--font-mono)] text-[11px] font-medium px-3 py-1 rounded-full ${
                    isFull ? "bg-red-100 text-red-500" : "bg-accent/10 text-accent"
                  }`}>
                    {isFull ? "FULL" : `${session.spotsRemaining}/${session.capacity} spots`}
                  </span>
                </div>
                <span className="font-[family-name:var(--font-body)] text-sm text-secondary">
                  {session.grade} &middot; {session.displayTime} &middot; ${session.price}
                </span>
                <div className="w-full h-1.5 bg-elevated rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isFull ? "bg-red-400" : "bg-accent"}`}
                    style={{ width: `${(session.spotsRemaining / session.capacity) * 100}%` }}
                  />
                </div>
                {isFull ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="w-full h-11 bg-white rounded-lg border border-border font-[family-name:var(--font-headline)] text-sm font-bold text-secondary tracking-wide hover:bg-surface transition-colors"
                  >
                    JOIN WAITLIST
                  </button>
                ) : (
                  <button className="w-full h-11 bg-accent rounded-lg font-[family-name:var(--font-headline)] text-sm font-bold text-white tracking-wide hover:bg-accent/90 transition-colors">
                    SELECT SESSION
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
