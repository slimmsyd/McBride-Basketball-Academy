"use server";

import { prisma } from "./prisma";

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
  const monday = new Date(mondayISO);
  monday.setHours(0, 0, 0, 0);

  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

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
