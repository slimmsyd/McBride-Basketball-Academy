"use server";

import { prisma } from "./prisma";
import { stripe, isStripeConfigured } from "./stripe";
import { createCalendarEvent, isCalendarConnected, getConnectedEmail, disconnectGoogle } from "./google-calendar";
import { sendBookingConfirmationEmails } from "./gmail";
import { revalidatePath } from "next/cache";

// ─── READ ───────────────────────────────────────────

export async function getSessionTypes() {
  return prisma.sessionType.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getSessionsForDate(dateStr: string) {
  const d = new Date(dateStr);
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

  // Auto-create sessions if none exist for this date
  await ensureSessionsForDate(date);

  const sessions = await prisma.scheduledSession.findMany({
    where: { date, isCancelled: false },
    include: {
      sessionType: true,
      _count: {
        select: { bookings: { where: { status: "confirmed" } } },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return sessions.map((s) => ({
    id: s.id,
    sessionTypeId: s.sessionTypeId,
    name: s.sessionType.name,
    grade: s.sessionType.grade,
    time: `${s.startTime} – ${s.endTime}`,
    displayTime: s.sessionType.defaultTime,
    price: Number(s.sessionType.price),
    capacity: s.capacity,
    bookedCount: s._count.bookings,
    spotsRemaining: s.capacity - s._count.bookings,
    color: s.sessionType.color,
    date: s.date.toISOString(),
    startTime: s.startTime,
    endTime: s.endTime,
  }));
}

// ─── BOOKING INPUT TYPE ────────────────────────────

type BookingInput = {
  scheduledSessionId: string;
  playerFirstName: string;
  playerLastName: string;
  playerGrade: string;
  playerAge?: number;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  paymentAmount: number;
  stripePaymentId: string;
};

// ─── SHARED BOOKING CORE ──────────────────────────

async function createBookingCore(data: BookingInput) {
  // Require payment when Stripe is configured
  if (isStripeConfigured() && !data.stripePaymentId) {
    throw new Error("Payment is required");
  }

  // Verify Stripe payment actually succeeded
  if (data.stripePaymentId) {
    if (!stripe) throw new Error("Stripe is not configured");
    const paymentIntent = await stripe.paymentIntents.retrieve(data.stripePaymentId);
    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment has not been completed");
    }
  }

  // Atomic capacity check + booking creation to prevent overbooking
  const booking = await prisma.$transaction(async (tx) => {
    const session = await tx.scheduledSession.findUnique({
      where: { id: data.scheduledSessionId },
      include: {
        _count: { select: { bookings: { where: { status: "confirmed" } } } },
      },
    });

    if (!session) throw new Error("Session not found");

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    if (session.date < todayUTC) {
      throw new Error("Cannot book a session in the past");
    }

    if (session._count.bookings >= session.capacity) {
      throw new Error("Session is full");
    }

    const confirmationNumber = generateConfNumber(session.date);

    return tx.booking.create({
      data: {
        scheduledSessionId: data.scheduledSessionId,
        confirmationNumber,
        playerFirstName: data.playerFirstName,
        playerLastName: data.playerLastName,
        playerGrade: data.playerGrade,
        playerAge: data.playerAge,
        parentName: data.parentName,
        parentEmail: data.parentEmail,
        parentPhone: data.parentPhone,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        medicalNotes: data.medicalNotes,
        paymentAmount: data.paymentAmount,
        paymentStatus: "paid",
        stripePaymentId: data.stripePaymentId,
        status: "confirmed",
      },
      include: {
        scheduledSession: { include: { sessionType: true } },
      },
    });
  }, { isolationLevel: "Serializable" });

  // Create Google Calendar event and store the event ID
  try {
    const calendarEventId = await createCalendarEvent({
      playerFirstName: booking.playerFirstName,
      playerLastName: booking.playerLastName,
      parentName: booking.parentName,
      parentEmail: booking.parentEmail,
      parentPhone: booking.parentPhone,
      sessionName: booking.scheduledSession.sessionType.name,
      sessionTime: booking.scheduledSession.sessionType.defaultTime,
      date: booking.scheduledSession.date.toISOString(),
      confirmationNumber: booking.confirmationNumber,
    });
    if (calendarEventId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { googleCalendarEventId: calendarEventId },
      });
    }
  } catch (e) {
    console.error("Failed to create calendar event:", e);
  }

  // Send confirmation emails (non-blocking)
  try {
    await sendBookingConfirmationEmails({
      confirmationNumber: booking.confirmationNumber,
      playerFirstName: booking.playerFirstName,
      playerLastName: booking.playerLastName,
      parentName: booking.parentName,
      parentEmail: booking.parentEmail,
      parentPhone: booking.parentPhone,
      sessionName: booking.scheduledSession.sessionType.name,
      sessionTime: booking.scheduledSession.sessionType.defaultTime,
      date: booking.scheduledSession.date.toISOString(),
      paymentAmount: Number(booking.paymentAmount),
    });
  } catch (e) {
    console.error("Failed to send confirmation emails:", e);
  }

  revalidatePath("/");
  revalidatePath("/booking");

  return {
    id: booking.id,
    confirmationNumber: booking.confirmationNumber,
    playerFirstName: booking.playerFirstName,
    playerLastName: booking.playerLastName,
    sessionName: booking.scheduledSession.sessionType.name,
    sessionTime: booking.scheduledSession.sessionType.defaultTime,
    date: booking.scheduledSession.date.toISOString(),
    parentEmail: booking.parentEmail,
    paymentAmount: Number(booking.paymentAmount),
  };
}

// ─── PUBLIC BOOKING ACTION ────────────────────────

export async function createBookingWithPayment(data: BookingInput) {
  return createBookingCore(data);
}

export async function joinWaitlist(data: {
  scheduledSessionId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  playerName: string;
}) {
  return prisma.waitlist.create({ data });
}

// ─── STRIPE ────────────────────────────────────────

export async function checkStripeConfigured() {
  return isStripeConfigured();
}

export async function createPaymentIntent(amount: number, metadata: Record<string, string>) {
  if (!stripe) throw new Error("Stripe is not configured");

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency: "usd",
    metadata,
  });

  return { clientSecret: paymentIntent.client_secret! };
}

// ─── GOOGLE CALENDAR ───────────────────────────────

export async function checkCalendarConnected() {
  return isCalendarConnected();
}

export async function getCalendarEmail() {
  return getConnectedEmail();
}

export async function disconnectCalendar() {
  await disconnectGoogle();
  revalidatePath("/admin");
}

// ─── HELPERS ────────────────────────────────────────

function generateConfNumber(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const rand = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `IMB-${y}-${m}${d}-${rand}`;
}

async function ensureSessionsForDate(date: Date) {
  const existing = await prisma.scheduledSession.findFirst({
    where: { date },
  });

  if (existing) return;

  const types = await prisma.sessionType.findMany({
    where: { active: true },
  });

  const timeMap: Record<string, { start: string; end: string }> = {
    "5:00 PM – 6:00 PM": { start: "17:00", end: "18:00" },
    "6:00 PM – 7:00 PM": { start: "18:00", end: "19:00" },
    "By Appointment": { start: "16:00", end: "17:00" },
  };

  for (const type of types) {
    const times = timeMap[type.defaultTime] || { start: "17:00", end: "18:00" };
    await prisma.scheduledSession.create({
      data: {
        sessionTypeId: type.id,
        date,
        startTime: times.start,
        endTime: times.end,
        capacity: type.capacity,
      },
    });
  }
}
