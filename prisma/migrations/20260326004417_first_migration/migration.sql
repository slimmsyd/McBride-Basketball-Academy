-- CreateTable
CREATE TABLE "session_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "default_time" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "price" DECIMAL(10,2) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "color" TEXT NOT NULL DEFAULT '#2979FF',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_sessions" (
    "id" TEXT NOT NULL,
    "session_type_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "is_cancelled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduled_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "scheduled_session_id" TEXT NOT NULL,
    "confirmation_number" TEXT NOT NULL,
    "player_first_name" TEXT NOT NULL,
    "player_last_name" TEXT NOT NULL,
    "player_grade" TEXT NOT NULL,
    "player_age" INTEGER,
    "parent_name" TEXT NOT NULL,
    "parent_email" TEXT NOT NULL,
    "parent_phone" TEXT NOT NULL,
    "emergency_contact" TEXT,
    "emergency_phone" TEXT,
    "medical_notes" TEXT,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "payment_amount" DECIMAL(10,2) NOT NULL,
    "stripe_payment_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" TEXT NOT NULL,
    "scheduled_session_id" TEXT NOT NULL,
    "parent_name" TEXT NOT NULL,
    "parent_email" TEXT NOT NULL,
    "parent_phone" TEXT NOT NULL,
    "player_name" TEXT NOT NULL,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "quote" TEXT NOT NULL,
    "reviewer_name" TEXT NOT NULL,
    "reviewer_role" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_confirmation_number_key" ON "bookings"("confirmation_number");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");

-- AddForeignKey
ALTER TABLE "scheduled_sessions" ADD CONSTRAINT "scheduled_sessions_session_type_id_fkey" FOREIGN KEY ("session_type_id") REFERENCES "session_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_scheduled_session_id_fkey" FOREIGN KEY ("scheduled_session_id") REFERENCES "scheduled_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_scheduled_session_id_fkey" FOREIGN KEY ("scheduled_session_id") REFERENCES "scheduled_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
