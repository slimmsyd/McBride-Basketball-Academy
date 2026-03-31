"use client";

import { useState } from "react";
import SessionSelection from "@/components/booking/SessionSelection";
import PlayerInfoForm from "@/components/booking/PlayerInfoForm";
import PaymentCheckout from "@/components/booking/PaymentCheckout";
import BookingConfirmation from "@/components/booking/BookingConfirmation";
import { createBookingWithPayment } from "@/lib/actions";

export interface BookingData {
  date: Date;
  session: {
    id: string;
    name: string;
    grade: string;
    time: string;
    price: number;
  } | null;
  player: {
    firstName: string;
    lastName: string;
    grade: string;
    age: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    emergencyContact: string;
    emergencyPhone: string;
    medicalNotes: string;
  } | null;
  confirmationNumber: string;
}

const INITIAL_BOOKING: BookingData = {
  date: new Date(),
  session: null,
  player: null,
  confirmationNumber: "",
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<BookingData>(INITIAL_BOOKING);
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async (stripePaymentId?: string) => {
    if (!booking.session || !booking.player) return;
    setSubmitting(true);
    try {
      const bookingData = {
        scheduledSessionId: booking.session.id,
        playerFirstName: booking.player.firstName,
        playerLastName: booking.player.lastName,
        playerGrade: booking.player.grade,
        playerAge: booking.player.age ? parseInt(booking.player.age) : undefined,
        parentName: booking.player.parentName,
        parentEmail: booking.player.parentEmail,
        parentPhone: booking.player.parentPhone,
        emergencyContact: booking.player.emergencyContact || undefined,
        emergencyPhone: booking.player.emergencyPhone || undefined,
        medicalNotes: booking.player.medicalNotes || undefined,
        paymentAmount: booking.session.price,
      };

      if (!stripePaymentId) {
        throw new Error("Payment is required to complete booking");
      }
      const result = await createBookingWithPayment({ ...bookingData, stripePaymentId });

      setBooking({
        ...booking,
        confirmationNumber: result.confirmationNumber,
      });
      setStep(4);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {step === 1 && (
        <SessionSelection
          booking={booking}
          onSelect={(date, session) => {
            setBooking({ ...booking, date, session });
            setStep(2);
          }}
          onBack={() => (window.location.href = "/#booking")}
        />
      )}
      {step === 2 && (
        <PlayerInfoForm
          booking={booking}
          onSubmit={(player) => {
            setBooking({ ...booking, player });
            setStep(3);
          }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <PaymentCheckout
          booking={booking}
          onPay={handlePay}
          submitting={submitting}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && <BookingConfirmation booking={booking} />}
    </div>
  );
}
