-- CreateIndex
CREATE INDEX "bookings_scheduled_session_id_idx" ON "bookings"("scheduled_session_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_stripe_payment_id_idx" ON "bookings"("stripe_payment_id");

-- CreateIndex
CREATE INDEX "scheduled_sessions_session_type_id_idx" ON "scheduled_sessions"("session_type_id");

-- CreateIndex
CREATE INDEX "scheduled_sessions_date_is_cancelled_idx" ON "scheduled_sessions"("date", "is_cancelled");

-- CreateIndex
CREATE INDEX "waitlist_scheduled_session_id_idx" ON "waitlist"("scheduled_session_id");
