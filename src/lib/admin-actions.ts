"use server";

import { prisma } from "./prisma";
import { stripe } from "./stripe";
import { deleteCalendarEvent } from "./google-calendar";
import { revalidatePath } from "next/cache";

// ─── SESSION TYPES (PROGRAMS) ─────────────────────

export async function getAllSessionTypes() {
  return prisma.sessionType.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function createSessionType(data: {
  name: string;
  grade: string;
  defaultTime: string;
  price: number;
  capacity: number;
  color: string;
  durationMinutes: number;
  sortOrder: number;
}) {
  return prisma.sessionType.create({ data });
}

export async function updateSessionType(
  id: string,
  data: {
    name?: string;
    grade?: string;
    defaultTime?: string;
    price?: number;
    capacity?: number;
    color?: string;
  }
) {
  return prisma.sessionType.update({ where: { id }, data });
}

export async function toggleSessionTypeActive(id: string) {
  const current = await prisma.sessionType.findUnique({ where: { id } });
  if (!current) throw new Error("Session type not found");
  return prisma.sessionType.update({
    where: { id },
    data: { active: !current.active },
  });
}

// ─── SCHEDULE ─────────────────────────────────────

export async function getWeekSessions(mondayISO: string) {
  const m = new Date(mondayISO);
  const monday = new Date(Date.UTC(m.getFullYear(), m.getMonth(), m.getDate()));

  const friday = new Date(monday);
  friday.setUTCDate(friday.getUTCDate() + 4);
  friday.setUTCHours(23, 59, 59, 999);

  const sessions = await prisma.scheduledSession.findMany({
    where: {
      date: { gte: monday, lte: friday },
      isCancelled: false,
    },
    include: {
      sessionType: true,
      _count: {
        select: { bookings: { where: { status: "confirmed" } } },
      },
    },
    orderBy: { startTime: "asc" },
  });

  // Group by date key (YYYY-MM-DD)
  const grouped: Record<
    string,
    {
      id: string;
      sessionTypeName: string;
      sessionTypeColor: string;
      grade: string;
      startTime: string;
      endTime: string;
      isCancelled: boolean;
      bookedCount: number;
      capacity: number;
    }[]
  > = {};

  for (const s of sessions) {
    const dateKey = s.date.toISOString().split("T")[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push({
      id: s.id,
      sessionTypeName: s.sessionType.name,
      sessionTypeColor: s.sessionType.color,
      grade: s.sessionType.grade,
      startTime: s.startTime,
      endTime: s.endTime,
      isCancelled: s.isCancelled,
      bookedCount: s._count.bookings,
      capacity: s.capacity,
    });
  }

  return grouped;
}

export async function addSessionToDay(sessionTypeId: string, dateISO: string) {
  const sessionType = await prisma.sessionType.findUnique({
    where: { id: sessionTypeId },
  });
  if (!sessionType) throw new Error("Session type not found");

  const timeMap: Record<string, { start: string; end: string }> = {
    "5:00 PM – 6:00 PM": { start: "17:00", end: "18:00" },
    "6:00 PM – 7:00 PM": { start: "18:00", end: "19:00" },
    "By Appointment": { start: "16:00", end: "17:00" },
  };

  const times = timeMap[sessionType.defaultTime] || {
    start: "17:00",
    end: "18:00",
  };

  const date = new Date(dateISO + "T00:00:00.000Z");

  return prisma.scheduledSession.create({
    data: {
      sessionTypeId,
      date,
      startTime: times.start,
      endTime: times.end,
      capacity: sessionType.capacity,
    },
  });
}

export async function cancelSession(scheduledSessionId: string) {
  return prisma.scheduledSession.update({
    where: { id: scheduledSessionId },
    data: { isCancelled: true },
  });
}

// ─── BOOKINGS ─────────────────────────────────────

export async function getBookings(filters?: { status?: string }) {
  const bookings = await prisma.booking.findMany({
    where: filters?.status ? { status: filters.status } : undefined,
    include: {
      scheduledSession: { include: { sessionType: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return bookings.map((b) => ({
    id: b.id,
    confirmationNumber: b.confirmationNumber,
    playerFirstName: b.playerFirstName,
    playerLastName: b.playerLastName,
    parentName: b.parentName,
    parentEmail: b.parentEmail,
    parentPhone: b.parentPhone,
    sessionName: b.scheduledSession.sessionType.name,
    sessionDate: b.scheduledSession.date.toISOString(),
    sessionTime: `${b.scheduledSession.startTime} – ${b.scheduledSession.endTime}`,
    paymentStatus: b.paymentStatus,
    paymentAmount: Number(b.paymentAmount),
    stripePaymentId: b.stripePaymentId,
    googleCalendarEventId: b.googleCalendarEventId,
    status: b.status,
    cancelledAt: b.cancelledAt?.toISOString() ?? null,
    createdAt: b.createdAt.toISOString(),
  }));
}

export async function cancelBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "cancelled") throw new Error("Already cancelled");

  // 1. Stripe refund (if payment exists)
  if (booking.stripePaymentId && stripe) {
    try {
      await stripe.refunds.create({
        payment_intent: booking.stripePaymentId,
      });
    } catch (e) {
      console.error("Failed to create Stripe refund:", e);
      throw new Error("Failed to process refund");
    }
  }

  // 2. Delete Google Calendar event (if stored)
  if (booking.googleCalendarEventId) {
    try {
      await deleteCalendarEvent(booking.googleCalendarEventId);
    } catch (e) {
      console.error("Failed to delete calendar event:", e);
    }
  }

  // 3. Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "cancelled",
      paymentStatus: booking.stripePaymentId ? "refunded" : booking.paymentStatus,
      cancelledAt: new Date(),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
}
