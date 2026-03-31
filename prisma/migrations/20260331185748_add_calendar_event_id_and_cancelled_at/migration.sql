-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "google_calendar_event_id" TEXT;
