"use client";

import { useState } from "react";
import type { BookingData } from "@/app/booking/page";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PaymentCheckout({
  booking,
  onPay,
  submitting,
  onBack,
}: {
  booking: BookingData;
  onPay: () => void;
  submitting?: boolean;
  onBack: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const canPay = agreed && cardNumber.length >= 16 && expiry.length >= 4 && cvc.length >= 3;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <button onClick={onBack} className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-[family-name:var(--font-body)] text-sm font-medium">Back to Player Details</span>
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {["Session", "Details", "Payment", "Confirmed"].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              i < 3 ? "bg-accent text-white" : "bg-surface text-muted"
            }`}>
              {i < 2 ? "✓" : i + 1}
            </div>
            <span className={`font-[family-name:var(--font-body)] text-sm font-medium hidden md:block ${i === 2 ? "text-primary" : "text-muted"}`}>{label}</span>
            {i < 3 && <div className="w-8 md:w-12 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Payment form */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-accent tracking-[3px]">PAYMENT</span>
            <h1 className="font-[family-name:var(--font-headline)] text-2xl md:text-3xl font-extrabold text-primary mt-2">COMPLETE BOOKING</h1>
          </div>

          {/* Order summary */}
          <div className="bg-surface rounded-xl p-5 flex flex-col gap-3">
            <div className="flex justify-between">
              <span className="font-[family-name:var(--font-body)] text-sm font-semibold text-primary">{booking.session?.name}</span>
              <span className="font-[family-name:var(--font-headline)] text-sm font-bold text-primary">${booking.session?.price}.00</span>
            </div>
            <span className="font-[family-name:var(--font-body)] text-[13px] text-secondary">
              {MONTH_NAMES[booking.date.getMonth()].slice(0, 3)} {booking.date.getDate()} &middot; {booking.session?.time} &middot; {booking.player?.firstName} {booking.player?.lastName}
            </span>
          </div>

          {/* Card fields */}
          <div className="flex flex-col gap-1.5">
            <label className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-secondary">Card Information</label>
            <div className="flex items-center bg-surface rounded-lg border border-border h-11 px-3.5">
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                className="flex-1 bg-transparent text-sm font-[family-name:var(--font-mono)] text-primary placeholder:text-muted outline-none"
              />
              <div className="flex gap-1.5">
                <div className="w-8 h-5 bg-[#1A1F71] rounded text-[7px] font-bold text-white flex items-center justify-center font-[family-name:var(--font-headline)]">VISA</div>
                <div className="w-8 h-5 bg-[#EB001B] rounded text-[8px] font-bold text-white flex items-center justify-center font-[family-name:var(--font-headline)]">MC</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full h-11 px-3.5 bg-surface rounded-lg border border-border text-sm font-[family-name:var(--font-mono)] text-primary placeholder:text-muted outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="CVC"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full h-11 px-3.5 bg-surface rounded-lg border border-border text-sm font-[family-name:var(--font-mono)] text-primary placeholder:text-muted outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setAgreed(!agreed)}
              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                agreed ? "bg-accent border-accent" : "bg-white border-border"
              }`}
            >
              {agreed && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="font-[family-name:var(--font-body)] text-[13px] text-secondary">
              I agree to the cancellation policy and terms of service
            </span>
          </label>

          {/* Pay button */}
          <button
            disabled={!canPay || submitting}
            onClick={() => canPay && !submitting && onPay()}
            className={`w-full h-[52px] rounded-lg font-[family-name:var(--font-headline)] text-lg font-bold tracking-wide flex items-center justify-center gap-2 transition-colors ${
              canPay && !submitting ? "bg-accent text-white hover:bg-accent/90" : "bg-elevated text-muted"
            }`}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                PAY ${booking.session?.price}.00
              </>
            )}
          </button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-[family-name:var(--font-body)] text-xs text-muted">
              Secured by Stripe. Your payment info is encrypted.
            </span>
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="w-full md:w-[340px] flex-shrink-0">
          <div className="bg-surface rounded-2xl p-6 flex flex-col gap-5 sticky top-24">
            <span className="font-[family-name:var(--font-mono)] text-[11px] font-medium text-muted tracking-[2px]">ORDER SUMMARY</span>
            <span className="font-[family-name:var(--font-headline)] text-xl font-bold text-primary">{booking.session?.name}</span>
            <div className="h-px bg-border" />
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="font-[family-name:var(--font-body)] text-[13px] text-muted">Session fee</span>
                <span className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-primary">${booking.session?.price}.00</span>
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
