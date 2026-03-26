"use server";

import { prisma } from "./prisma";
import { stripe, isStripeConfigured } from "./stripe";

// ─── READ ───────────────────────────────────────────

export async function getSessionTypes() {
  return prisma.sessionType.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getSessionsForDate(dateStr: string) {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

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

export async function getReviews() {
  return prisma.review.findMany({
    where: { visible: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ─── WRITE ──────────────────────────────────────────

export async function createBooking(data: {
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
}) {
  // Get the session to verify it exists and has spots
  const session = await prisma.scheduledSession.findUnique({
    where: { id: data.scheduledSessionId },
    include: {
      _count: { select: { bookings: { where: { status: "confirmed" } } } },
    },
  });

  if (!session) throw new Error("Session not found");
  if (session._count.bookings >= session.capacity) {
    throw new Error("Session is full");
  }

  const confirmationNumber = generateConfNumber(session.date);

  const booking = await prisma.booking.create({
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
      status: "confirmed",
    },
    include: {
      scheduledSession: { include: { sessionType: true } },
    },
  });

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

export async function createBookingWithPayment(data: {
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
}) {
  const session = await prisma.scheduledSession.findUnique({
    where: { id: data.scheduledSessionId },
    include: {
      _count: { select: { bookings: { where: { status: "confirmed" } } } },
    },
  });

  if (!session) throw new Error("Session not found");
  if (session._count.bookings >= session.capacity) {
    throw new Error("Session is full");
  }

  const confirmationNumber = generateConfNumber(session.date);

  const booking = await prisma.booking.create({
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

// ─── HELPERS ────────────────────────────────────────

function generateConfNumber(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
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
