import { google } from "googleapis";
import { prisma } from "./prisma";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
];

/** Generate the URL Issac clicks to authorize his Google Calendar */
export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
}

/** Exchange the authorization code for tokens and store the refresh token */
export async function handleCallback(code: string) {
  const { tokens } = await oauth2Client.getToken(code);

  if (tokens.refresh_token) {
    await prisma.siteSetting.upsert({
      where: { key: "google_refresh_token" },
      update: { value: tokens.refresh_token },
      create: { key: "google_refresh_token", value: tokens.refresh_token },
    });
  }

  // Fetch and store the connected account's email
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  if (data.email) {
    await prisma.siteSetting.upsert({
      where: { key: "google_connected_email" },
      update: { value: data.email },
      create: { key: "google_connected_email", value: data.email },
    });
  }

  return tokens;
}

/** Get an authenticated Google Calendar client using the stored refresh token */
async function getCalendarClient() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "google_refresh_token" },
  });

  if (!setting?.value) {
    return null;
  }

  oauth2Client.setCredentials({ refresh_token: setting.value });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

/** Check if Google Calendar is connected */
export async function isCalendarConnected(): Promise<boolean> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "google_refresh_token" },
  });
  return !!setting?.value;
}

/** Get the connected Google account email */
export async function getConnectedEmail(): Promise<string | null> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "google_connected_email" },
  });
  return setting?.value ?? null;
}

/** Disconnect Google account by removing stored tokens and email */
export async function disconnectGoogle() {
  await prisma.siteSetting.deleteMany({
    where: { key: { in: ["google_refresh_token", "google_connected_email"] } },
  });
}

/** Create a Google Calendar event when a booking is made */
export async function createCalendarEvent(booking: {
  playerFirstName: string;
  playerLastName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  sessionName: string;
  sessionTime: string;
  date: string;
  confirmationNumber: string;
}) {
  const calendar = await getCalendarClient();
  if (!calendar) return null;

  // Parse the session time (e.g. "5:00 PM – 6:00 PM")
  const { startDateTime, endDateTime } = parseSessionDateTime(
    booking.date,
    booking.sessionTime
  );

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  const event = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `${booking.sessionName} — ${booking.playerFirstName} ${booking.playerLastName}`,
      description: [
        `Player: ${booking.playerFirstName} ${booking.playerLastName}`,
        `Parent: ${booking.parentName}`,
        `Email: ${booking.parentEmail}`,
        `Phone: ${booking.parentPhone}`,
        `Confirmation: ${booking.confirmationNumber}`,
      ].join("\n"),
      start: {
        dateTime: startDateTime,
        timeZone: "America/Chicago",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "America/Chicago",
      },
      colorId: "9", // blue
    },
  });

  return event.data.id;
}

/** Delete a Google Calendar event (when a session is cancelled) */
export async function deleteCalendarEvent(eventId: string) {
  const calendar = await getCalendarClient();
  if (!calendar) return;

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  await calendar.events.delete({
    calendarId,
    eventId,
  });
}

/** Parse "5:00 PM – 6:00 PM" + date into ISO datetime strings */
function parseSessionDateTime(
  dateStr: string,
  timeRange: string
): { startDateTime: string; endDateTime: string } {
  const date = new Date(dateStr);
  const datePrefix = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  // Try to parse "5:00 PM – 6:00 PM" format
  const match = timeRange.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );

  if (match) {
    const startHour = to24Hour(parseInt(match[1]), match[3]);
    const startMin = match[2];
    const endHour = to24Hour(parseInt(match[4]), match[6]);
    const endMin = match[5];

    return {
      startDateTime: `${datePrefix}T${String(startHour).padStart(2, "0")}:${startMin}:00`,
      endDateTime: `${datePrefix}T${String(endHour).padStart(2, "0")}:${endMin}:00`,
    };
  }

  // Fallback: default 5-6 PM
  return {
    startDateTime: `${datePrefix}T17:00:00`,
    endDateTime: `${datePrefix}T18:00:00`,
  };
}

function to24Hour(hour: number, ampm: string): number {
  const upper = ampm.toUpperCase();
  if (upper === "AM" && hour === 12) return 0;
  if (upper === "PM" && hour !== 12) return hour + 12;
  return hour;
}
