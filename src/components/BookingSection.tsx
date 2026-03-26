"use client";

import { useState, useEffect } from "react";
import { getSessionsForDate } from "@/lib/actions";

type SessionData = {
  id: string;
  name: string;
  grade: string;
  displayTime: string;
  price: number;
  capacity: number;
  spotsRemaining: number;
};

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function Calendar({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const isSelected = (day: number) =>
    day === selectedDate.getDate() &&
    viewMonth === selectedDate.getMonth() &&
    viewYear === selectedDate.getFullYear();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-border p-4 md:p-6 flex flex-col gap-4 md:gap-5">
      <div className="flex justify-between items-center">
        <span className="font-[family-name:var(--font-headline)] text-lg md:text-xl font-bold text-primary">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center bg-surface rounded-lg text-secondary hover:bg-elevated transition-colors"
          >
            &larr;
          </button>
          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center bg-surface rounded-lg text-secondary hover:bg-elevated transition-colors"
          >
            &rarr;
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className="font-[family-name:var(--font-mono)] text-[11px] font-medium text-muted text-center py-2"
          >
            {d}
          </div>
        ))}
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() =>
              day && onSelectDate(new Date(viewYear, viewMonth, day))
            }
            className={`h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors relative ${
              day && isSelected(day)
                ? "bg-accent text-white font-bold"
                : day && isToday(day)
                  ? "text-accent font-bold ring-2 ring-accent/30"
                  : day
                    ? "text-primary hover:bg-surface"
                    : ""
            }`}
            disabled={!day}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

function SessionCard({
  name,
  grade,
  time,
  spots,
  total,
  selected,
  onSelect,
}: {
  name: string;
  grade: string;
  time: string;
  spots: number;
  total: number;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`flex flex-col gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-3xl border-2 transition-all cursor-pointer ${selected ? "border-accent shadow-lg shadow-accent/10" : "border-border hover:border-accent/40"}`}
    >
      <div className="flex justify-between items-center">
        <span className="font-[family-name:var(--font-headline)] text-lg font-bold text-primary">
          {name}
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[11px] font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
          {spots} SPOTS LEFT
        </span>
      </div>
      <span className="font-[family-name:var(--font-body)] text-sm text-secondary">
        {grade}
      </span>
      <div className="flex items-center gap-2 text-secondary">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="font-[family-name:var(--font-mono)] text-[13px] font-medium text-primary">
          {time}
        </span>
      </div>
      <div className="flex items-center gap-2 text-muted">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            strokeWidth="2"
          />
          <circle cx="9" cy="7" r="4" strokeWidth="2" />
        </svg>
        <span className="font-[family-name:var(--font-body)] text-[13px]">
          {total} person cap per session
        </span>
      </div>
    </div>
  );
}

function formatSelectedDate(date: Date): string {
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function BookingSection() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSelectedSession(null);
    getSessionsForDate(selectedDate.toISOString())
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDate]);

  return (
    <section id="booking" className="py-12 px-6 md:py-20 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-2 mb-8 md:mb-12">
          <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-accent tracking-[3px]">
            SCHEDULE
          </span>
          <h2 className="font-[family-name:var(--font-headline)] text-3xl md:text-5xl font-extrabold text-primary text-center">
            BOOK YOUR SESSION
          </h2>
          <p className="font-[family-name:var(--font-body)] text-sm md:text-base text-secondary">
            Daily sessions available 7 days a week
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="w-full md:flex-1">
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
          <div className="w-full md:flex-1 flex flex-col gap-4 md:gap-6">
            <div>
              <h3 className="font-[family-name:var(--font-headline)] text-xl font-bold text-primary">
                AVAILABLE SESSIONS
              </h3>
              <p className="font-[family-name:var(--font-body)] text-sm text-secondary mt-1">
                {formatSelectedDate(selectedDate)}
              </p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="font-[family-name:var(--font-body)] text-sm text-muted py-8 text-center">
                No sessions available for this date.
              </p>
            ) : (
              sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  name={session.name}
                  grade={session.grade}
                  time={session.displayTime}
                  spots={session.spotsRemaining}
                  total={session.capacity}
                  selected={selectedSession === session.id}
                  onSelect={() => setSelectedSession(session.id)}
                />
              ))
            )}
            <a
              href={selectedSession ? "/booking" : undefined}
              className={`w-full h-14 font-[family-name:var(--font-headline)] text-lg font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-colors ${
                selectedSession
                  ? "bg-accent text-white hover:bg-accent/90"
                  : "bg-elevated text-muted pointer-events-none"
              }`}
            >
              PAY &amp; BOOK &mdash; ${sessions.find((s) => s.id === selectedSession)?.price ?? 20}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
