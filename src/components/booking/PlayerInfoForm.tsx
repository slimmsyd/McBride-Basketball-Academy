"use client";

import { useState } from "react";
import type { BookingData } from "@/app/booking/page";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function Input({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-secondary">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3.5 bg-surface rounded-lg border border-border text-sm font-[family-name:var(--font-body)] text-primary placeholder:text-muted outline-none focus:border-accent transition-colors"
      />
    </div>
  );
}

export default function PlayerInfoForm({
  booking,
  onSubmit,
  onBack,
}: {
  booking: BookingData;
  onSubmit: (player: NonNullable<BookingData["player"]>) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", grade: "", age: "",
    parentName: "", parentEmail: "", parentPhone: "",
    emergencyContact: "", emergencyPhone: "", medicalNotes: "",
  });

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });
  const canSubmit = form.firstName && form.lastName && form.grade && form.parentName && form.parentEmail && form.parentPhone;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <button onClick={onBack} className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-[family-name:var(--font-body)] text-sm font-medium">Back to Sessions</span>
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {["Session", "Details", "Payment", "Confirmed"].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              i < 2 ? "bg-accent text-white" : "bg-surface text-muted"
            }`}>
              {i < 1 ? "✓" : i + 1}
            </div>
            <span className={`font-[family-name:var(--font-body)] text-sm font-medium hidden md:block ${i === 1 ? "text-primary" : "text-muted"}`}>{label}</span>
            {i < 3 && <div className="w-8 md:w-12 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Form */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-accent tracking-[3px]">PLAYER DETAILS</span>
            <h1 className="font-[family-name:var(--font-headline)] text-2xl md:text-3xl font-extrabold text-primary mt-2">ENTER INFORMATION</h1>
          </div>

          <div className="flex gap-4">
            <div className="flex-1"><Input label="Player First Name" placeholder="First name" value={form.firstName} onChange={(v) => update("firstName", v)} /></div>
            <div className="flex-1"><Input label="Player Last Name" placeholder="Last name" value={form.lastName} onChange={(v) => update("lastName", v)} /></div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex flex-col gap-1.5">
                <label className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-secondary">Grade</label>
                <select
                  value={form.grade}
                  onChange={(e) => update("grade", e.target.value)}
                  className="w-full h-11 px-3.5 bg-surface rounded-lg border border-border text-sm font-[family-name:var(--font-body)] text-primary outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Select grade</option>
                  {["6th", "7th", "8th", "9th", "10th", "11th", "12th"].map((g) => (
                    <option key={g} value={g}>{g} Grade</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1"><Input label="Age" placeholder="Age" value={form.age} onChange={(v) => update("age", v)} /></div>
          </div>

          <div className="h-px bg-border" />

          <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-accent tracking-[3px]">PARENT / GUARDIAN</span>

          <Input label="Parent/Guardian Name" placeholder="Full name" value={form.parentName} onChange={(v) => update("parentName", v)} />

          <div className="flex gap-4">
            <div className="flex-1"><Input label="Email" placeholder="parent@email.com" value={form.parentEmail} onChange={(v) => update("parentEmail", v)} type="email" /></div>
            <div className="flex-1"><Input label="Phone" placeholder="(555) 000-0000" value={form.parentPhone} onChange={(v) => update("parentPhone", v)} type="tel" /></div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1"><Input label="Emergency Contact" placeholder="Name" value={form.emergencyContact} onChange={(v) => update("emergencyContact", v)} /></div>
            <div className="flex-1"><Input label="Emergency Phone" placeholder="(555) 000-0000" value={form.emergencyPhone} onChange={(v) => update("emergencyPhone", v)} type="tel" /></div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-secondary">Medical Notes / Allergies (optional)</label>
            <textarea
              placeholder="Any medical conditions or allergies..."
              value={form.medicalNotes}
              onChange={(e) => update("medicalNotes", e.target.value)}
              rows={3}
              className="w-full px-3.5 py-3 bg-surface rounded-lg border border-border text-sm font-[family-name:var(--font-body)] text-primary placeholder:text-muted outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          <button
            disabled={!canSubmit}
            onClick={() => canSubmit && onSubmit(form)}
            className={`w-full h-12 rounded-lg font-[family-name:var(--font-headline)] text-base font-bold tracking-wide flex items-center justify-center gap-2 transition-colors ${
              canSubmit ? "bg-accent text-white hover:bg-accent/90" : "bg-elevated text-muted"
            }`}
          >
            CONTINUE TO PAYMENT →
          </button>
        </div>

        {/* Session summary sidebar */}
        <div className="w-full md:w-[340px] flex-shrink-0">
          <div className="bg-surface rounded-2xl p-6 flex flex-col gap-5 sticky top-24">
            <span className="font-[family-name:var(--font-mono)] text-[11px] font-medium text-muted tracking-[2px]">SESSION SUMMARY</span>
            <span className="font-[family-name:var(--font-headline)] text-xl font-bold text-primary">{booking.session?.name}</span>
            <div className="h-px bg-border" />
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="font-[family-name:var(--font-body)] text-[13px] text-muted">Date</span>
                <span className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-primary">
                  {MONTH_NAMES[booking.date.getMonth()].slice(0, 3)} {booking.date.getDate()}, {booking.date.getFullYear()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-[family-name:var(--font-body)] text-[13px] text-muted">Time</span>
                <span className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-primary">{booking.session?.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-[family-name:var(--font-body)] text-[13px] text-muted">Grade</span>
                <span className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-primary">{booking.session?.grade}</span>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="font-[family-name:var(--font-headline)] text-base font-bold text-primary">Total</span>
              <span className="font-[family-name:var(--font-headline)] text-2xl font-extrabold text-accent">${booking.session?.price}.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
