"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { BookingData } from "@/app/booking/page";
import { createPaymentIntent, checkStripeConfigured } from "@/lib/actions";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;
const isTestMode = STRIPE_PK.startsWith("pk_test_");

export default function PaymentCheckout({
  booking,
  onPay,
  submitting,
  onBack,
}: {
  booking: BookingData;
  onPay: (stripePaymentId?: string) => void;
  submitting?: boolean;
  onBack: () => void;
}) {
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const configured = await checkStripeConfigured();
      setStripeEnabled(configured);

      if (configured && booking.session) {
        const { clientSecret: cs } = await createPaymentIntent(
          booking.session.price,
          {
            sessionId: booking.session.id,
            playerName: `${booking.player?.firstName} ${booking.player?.lastName}`,
          }
        );
        setClientSecret(cs);
      }
      setLoading(false);
    }
    init();
  }, [booking.session, booking.player]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

          {/* Order summary inline */}
          <div className="bg-surface rounded-xl p-5 flex flex-col gap-3">
            <div className="flex justify-between">
              <span className="font-[family-name:var(--font-body)] text-sm font-semibold text-primary">{booking.session?.name}</span>
              <span className="font-[family-name:var(--font-headline)] text-sm font-bold text-primary">${booking.session?.price}.00</span>
            </div>
            <span className="font-[family-name:var(--font-body)] text-[13px] text-secondary">
              {MONTH_NAMES[booking.date.getMonth()].slice(0, 3)} {booking.date.getDate()} &middot; {booking.session?.time} &middot; {booking.player?.firstName} {booking.player?.lastName}
            </span>
          </div>

          {stripeEnabled && clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
              <StripePaymentForm onPay={onPay} submitting={submitting} price={booking.session?.price ?? 0} clientSecret={clientSecret} />
            </Elements>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="font-[family-name:var(--font-body)] text-sm text-red-700 font-medium">
                Payment processing is currently unavailable. Please try again later or contact us for assistance.
              </p>
            </div>
          )}

          {/* Security note */}
          <div className="flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-[family-name:var(--font-body)] text-xs text-muted">
              {stripeEnabled ? "Secured by Stripe. Your payment info is encrypted." : "Payment processing coming soon. Booking will be confirmed."}
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

function StripePaymentForm({
  onPay,
  submitting,
  price,
  clientSecret,
}: {
  onPay: (stripePaymentId?: string) => void;
  submitting?: boolean;
  price: number;
  clientSecret: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements || !agreed) return;
    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Payment failed");
      setProcessing(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed");
      setProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      onPay(paymentIntent.id);
    }
  };

  const handleTestPay = async () => {
    if (!stripe) return;
    setProcessing(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret!,
      { payment_method: "pm_card_visa" }
    );

    if (confirmError) {
      setError(confirmError.message ?? "Test payment failed");
      setProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      onPay(paymentIntent.id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {isTestMode && (
        <button
          onClick={handleTestPay}
          disabled={processing || submitting}
          className="w-full h-[44px] rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 font-[family-name:var(--font-body)] text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Test Pay with 4242 (skip form)</>
          )}
        </button>
      )}

      <PaymentElement />

      {error && (
        <p className="font-[family-name:var(--font-body)] text-sm text-[#FA541C]">{error}</p>
      )}

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

      <button
        disabled={!agreed || processing || submitting || !stripe}
        onClick={handleSubmit}
        className={`w-full h-[52px] rounded-lg font-[family-name:var(--font-headline)] text-lg font-bold tracking-wide flex items-center justify-center gap-2 transition-colors ${
          agreed && !processing && !submitting ? "bg-accent text-white hover:bg-accent/90" : "bg-elevated text-muted"
        }`}
      >
        {processing || submitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            PAY ${price}.00
          </>
        )}
      </button>
    </div>
  );
}

function TestBookingForm({
  onPay,
  submitting,
  price,
}: {
  onPay: () => void;
  submitting?: boolean;
  price: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <span className="font-[family-name:var(--font-body)] text-sm text-amber-800 font-medium">
          Dev Mode — Payment processing not connected. Click below to complete booking.
        </span>
      </div>

      <button
        disabled={submitting}
        onClick={() => !submitting && onPay()}
        className={`w-full h-[52px] rounded-lg font-[family-name:var(--font-headline)] text-lg font-bold tracking-wide flex items-center justify-center gap-2 transition-colors ${
          !submitting ? "bg-accent text-white hover:bg-accent/90" : "bg-elevated text-muted"
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
            BOOK NOW — ${price}.00
          </>
        )}
      </button>
    </div>
  );
}
