import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.scheduledSession.deleteMany();
  await prisma.sessionType.deleteMany();
  await prisma.review.deleteMany();
  await prisma.siteSetting.deleteMany();

  // Session Types
  const ms = await prisma.sessionType.create({
    data: {
      name: "MIDDLE SCHOOL TRAINING",
      grade: "6th – 8th Grade",
      defaultTime: "5:00 PM – 6:00 PM",
      durationMinutes: 60,
      price: 20,
      capacity: 10,
      color: "#2979FF",
      active: true,
      sortOrder: 1,
    },
  });

  const hs = await prisma.sessionType.create({
    data: {
      name: "HIGH SCHOOL TRAINING",
      grade: "9th – 12th Grade",
      defaultTime: "6:00 PM – 7:00 PM",
      durationMinutes: 60,
      price: 20,
      capacity: 10,
      color: "#7C3AED",
      active: true,
      sortOrder: 2,
    },
  });

  const priv = await prisma.sessionType.create({
    data: {
      name: "PRIVATE 1-ON-1",
      grade: "All Ages",
      defaultTime: "By Appointment",
      durationMinutes: 60,
      price: 75,
      capacity: 1,
      color: "#FA541C",
      active: true,
      sortOrder: 3,
    },
  });

  console.log(`Created ${3} session types`);

  // Scheduled Sessions — next 30 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sessionTypes = [
    { type: ms, start: "17:00", end: "18:00" },
    { type: hs, start: "18:00", end: "19:00" },
    { type: priv, start: "16:00", end: "17:00" },
  ];

  let sessionCount = 0;
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    for (const st of sessionTypes) {
      await prisma.scheduledSession.create({
        data: {
          sessionTypeId: st.type.id,
          date,
          startTime: st.start,
          endTime: st.end,
          capacity: st.type.capacity,
        },
      });
      sessionCount++;
    }
  }
  console.log(`Created ${sessionCount} scheduled sessions (30 days × 3 types)`);

  // Reviews
  await prisma.review.createMany({
    data: [
      {
        stars: 5,
        quote:
          "Isaac transformed my son's game completely. His fundamentals improved dramatically in just 2 months. The best investment we've made in his basketball development.",
        reviewerName: "Sarah Johnson",
        reviewerRole: "Parent of 8th Grader",
        visible: true,
        sortOrder: 1,
      },
      {
        stars: 5,
        quote:
          "Coach McBride pushes you to be better every single day. He doesn't just teach basketball — he teaches discipline, work ethic, and how to compete. I've gotten so much better since training with him.",
        reviewerName: "Marcus Williams",
        reviewerRole: "High School Junior",
        visible: true,
        sortOrder: 2,
      },
      {
        stars: 5,
        quote:
          "We drive 45 minutes each way for Isaac's sessions and it's worth every mile. My daughter's confidence on the court has skyrocketed. He has a gift for connecting with young athletes.",
        reviewerName: "David Chen",
        reviewerRole: "Parent of 6th Grader",
        visible: true,
        sortOrder: 3,
      },
    ],
  });
  console.log("Created 3 reviews");

  // Site Settings
  await prisma.siteSetting.createMany({
    data: [
      { key: "default_price", value: "20" },
      { key: "default_capacity", value: "10" },
      { key: "cancellation_policy", value: "Full refund up to 24 hours before session." },
      { key: "business_name", value: "McBride Basketball Academy" },
      { key: "business_email", value: "isaac@mcbridetraining.com" },
      { key: "business_phone", value: "(555) 123-4567" },
    ],
  });
  console.log("Created 6 site settings");

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
