"use client";

import { useState, useEffect } from "react";
import { getBookings, cancelBooking } from "@/lib/admin-actions";

type BookingRow = {
  id: string;
  confirmationNumber: string;
  playerFirstName: string;
  playerLastName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  sessionName: string;
  sessionDate: string;
  sessionTime: string;
  paymentStatus: string;
  paymentAmount: number;
  stripePaymentId: string | null;
  googleCalendarEventId: string | null;
  status: string;
  cancelledAt: string | null;
  createdAt: string;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "confirmed" | "cancelled">("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const data = await getBookings(filter === "all" ? undefined : { status: filter });
    setBookings(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking and issue a refund? This cannot be undone.")) return;
    setCancellingId(id);
    try {
      await cancelBooking(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="font-[family-name:var(--font-mono)] text-[11px] font-medium text-accent tracking-[3px]">ADMIN</span>
            <h1 className="font-[family-name:var(--font-headline)] text-2xl font-extrabold text-primary mt-1">Bookings</h1>
          </div>

          <div className="flex gap-2">
            {(["all", "confirmed", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-accent text-white"
                    : "bg-surface text-secondary hover:bg-elevated"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-surface rounded-xl p-12 text-center">
            <p className="font-[family-name:var(--font-body)] text-secondary">No bookings found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className={`bg-surface rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 ${
                  b.status === "cancelled" ? "opacity-60" : ""
                }`}
              >
                {/* Player & Session Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-[family-name:var(--font-headline)] text-base font-bold text-primary">
                      {b.playerFirstName} {b.playerLastName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                      b.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {b.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                      b.paymentStatus === "paid" ? "bg-blue-100 text-blue-700"
                        : b.paymentStatus === "refunded" ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </div>
                  <p className="font-[family-name:var(--font-body)] text-sm text-secondary">
                    {b.sessionName} &middot; {formatDate(b.sessionDate)} &middot; {b.sessionTime}
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-xs text-muted mt-1">
                    {b.confirmationNumber} &middot; {b.parentName} &middot; {b.parentEmail}
                  </p>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-4">
                  <span className="font-[family-name:var(--font-headline)] text-lg font-bold text-primary">
                    ${b.paymentAmount.toFixed(2)}
                  </span>

                  {b.status === "confirmed" && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={cancellingId === b.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {cancellingId === b.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Cancel & Refund"
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
