"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import {
  getWeekSessions,
  getAllSessionTypes,
  addSessionToDay,
  cancelSession,
} from "@/lib/admin-actions";

type ScheduledSession = {
  id: string;
  sessionTypeName: string;
  sessionTypeColor: string;
  grade: string;
  startTime: string;
  endTime: string;
  isCancelled: boolean;
  bookedCount: number;
  capacity: number;
};

type SessionType = {
  id: string;
  name: string;
  color: string;
  defaultTime: string;
};

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI"];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(monday: Date): string {
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[monday.getMonth()]} ${monday.getDate()} – ${friday.getDate()}, ${monday.getFullYear()}`;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function AdminSchedulePage() {
  const [monday, setMonday] = useState(() => getMonday(new Date()));
  const [sessions, setSessions] = useState<Record<string, ScheduledSession[]>>({});
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDay, setAddingDay] = useState<string | null>(null);

  const loadWeek = async () => {
    setLoading(true);
    const [weekData, types] = await Promise.all([
      getWeekSessions(monday.toISOString()),
      getAllSessionTypes(),
    ]);
    setSessions(weekData);
    setSessionTypes(types.filter((t) => t.active).map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      defaultTime: t.defaultTime,
    })));
    setLoading(false);
  };

  useEffect(() => { loadWeek(); }, [monday]);

  const prevWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() - 7);
    setMonday(d);
  };

  const nextWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 7);
    setMonday(d);
  };

  const handleAddSession = async (sessionTypeId: string, dateISO: string) => {
    await addSessionToDay(sessionTypeId, dateISO);
    setAddingDay(null);
    await loadWeek();
  };

  const handleCancel = async (sessionId: string) => {
    await cancelSession(sessionId);
    await loadWeek();
  };

  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-headline)] text-2xl font-extrabold text-[#18181B]">
          Weekly Schedule
        </h1>
      </div>

      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevWeek} className="text-[#52525B] hover:text-[#18181B] transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="font-[family-name:var(--font-headline)] text-base font-bold text-[#18181B]">
          {formatWeekLabel(monday)}
        </span>
        <button onClick={nextWeek} className="text-[#52525B] hover:text-[#18181B] transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Week grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-[#2979FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {weekDays.map((day, i) => {
            const dateKey = day.toISOString().split("T")[0];
            const daySessions = sessions[dateKey] || [];
            const isToday = day.getTime() === today.getTime();

            return (
              <div
                key={dateKey}
                className={`flex flex-col gap-2 rounded-xl p-3 min-h-[400px] border ${
                  isToday
                    ? "border-[#2979FF] border-2 bg-white"
                    : "border-[#E4E4E7] bg-white"
                }`}
              >
                {/* Day header */}
                <span
                  className={`font-[family-name:var(--font-mono)] text-[11px] font-medium text-center ${
                    isToday ? "text-[#2979FF] font-semibold" : "text-[#A1A1AA]"
                  }`}
                >
                  {DAY_LABELS[i]} {day.getDate()}
                </span>

                {/* Session cards */}
                {daySessions.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-md p-2 flex flex-col gap-1 relative group"
                    style={{ backgroundColor: s.sessionTypeColor + "15" }}
                  >
                    <span
                      className="font-[family-name:var(--font-body)] text-xs font-semibold"
                      style={{ color: s.sessionTypeColor }}
                    >
                      {s.sessionTypeName}
                    </span>
                    <span className="font-[family-name:var(--font-body)] text-[10px] text-[#52525B]">
                      {formatTime(s.startTime)} – {formatTime(s.endTime)}
                    </span>
                    <span className="font-[family-name:var(--font-body)] text-[10px] text-[#A1A1AA]">
                      {s.bookedCount}/{s.capacity} booked
                    </span>
                    <button
                      onClick={() => handleCancel(s.id)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FA541C]/10"
                    >
                      <X size={12} className="text-[#FA541C]" />
                    </button>
                  </div>
                ))}

                {/* Add session button */}
                {addingDay === dateKey ? (
                  <div className="flex flex-col gap-1 p-2 bg-[#F4F4F5] rounded-lg">
                    {sessionTypes.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleAddSession(st.id, dateKey)}
                        className="text-left text-xs font-[family-name:var(--font-body)] px-2 py-1.5 rounded hover:bg-white transition-colors"
                        style={{ color: st.color }}
                      >
                        + {st.name}
                      </button>
                    ))}
                    <button
                      onClick={() => setAddingDay(null)}
                      className="text-[10px] text-[#A1A1AA] mt-1 font-[family-name:var(--font-body)]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingDay(dateKey)}
                    className="flex items-center justify-center gap-1 h-8 rounded-lg border border-dashed border-[#E4E4E7] text-[#A1A1AA] hover:border-[#2979FF] hover:text-[#2979FF] transition-colors mt-auto"
                  >
                    <Plus size={14} />
                    <span className="font-[family-name:var(--font-body)] text-[11px] font-medium">Add</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
