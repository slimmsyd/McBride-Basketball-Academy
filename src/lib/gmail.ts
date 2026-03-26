import { google } from "googleapis";
import { prisma } from "./prisma";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function getGmailClient() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "google_refresh_token" },
  });

  if (!setting?.value) return null;

  oauth2Client.setCredentials({ refresh_token: setting.value });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

async function sendEmail(to: string, subject: string, html: string) {
  const gmail = await getGmailClient();
  if (!gmail) return null;

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    Buffer.from(html).toString("base64"),
  ].join("\r\n");

  const raw = Buffer.from(message).toString("base64url");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  return res.data.id;
}

type BookingEmailData = {
  confirmationNumber: string;
  playerFirstName: string;
  playerLastName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  sessionName: string;
  sessionTime: string;
  date: string;
  paymentAmount: number;
};

export async function sendBookingConfirmationEmails(booking: BookingEmailData) {
  const ownerEmail = process.env.BUSINESS_OWNER_EMAIL;

  await Promise.allSettled([
    sendEmail(
      booking.parentEmail,
      `Booking Confirmed - ${booking.confirmationNumber}`,
      buildClientConfirmationHtml(booking)
    ),
    ownerEmail
      ? sendEmail(
          ownerEmail,
          `New Booking - ${booking.playerFirstName} ${booking.playerLastName} - ${booking.sessionName}`,
          buildOwnerNotificationHtml(booking)
        )
      : Promise.resolve(),
  ]);
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function buildClientConfirmationHtml(booking: BookingEmailData): string {
  const date = formatDate(booking.date);
  const amount = formatCurrency(booking.paymentAmount);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;">
      <div style="background:#2979FF;padding:32px;text-align:center;">
        <div style="font-size:40px;margin-bottom:8px;">&#127936;</div>
        <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0;letter-spacing:1px;">YOU'RE BOOKED!</h1>
      </div>
      <div style="padding:32px;">
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Hi ${booking.parentName},<br><br>
          Your basketball training session has been confirmed. Here are your booking details:
        </p>
        <div style="background:#f9fafb;border-radius:12px;padding:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:13px;">Confirmation</td>
              <td style="padding:8px 0;color:#2979FF;font-size:13px;font-weight:700;text-align:right;">${booking.confirmationNumber}</td>
            </tr>
            <tr><td colspan="2" style="border-bottom:1px solid #e5e7eb;"></td></tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:13px;">Player</td>
              <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${booking.playerFirstName} ${booking.playerLastName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:13px;">Session</td>
              <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${booking.sessionName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:13px;">Date</td>
              <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${date}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:13px;">Time</td>
              <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${booking.sessionTime}</td>
            </tr>
            <tr><td colspan="2" style="border-bottom:1px solid #e5e7eb;"></td></tr>
            <tr>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:700;">Amount Paid</td>
              <td style="padding:8px 0;color:#2979FF;font-size:16px;font-weight:800;text-align:right;">${amount}</td>
            </tr>
          </table>
        </div>
        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:24px 0 0;">
          If you need to cancel or reschedule, please contact us at <a href="mailto:issac5.mcbride@gmail.com" style="color:#2979FF;text-decoration:none;">issac5.mcbride@gmail.com</a>.
        </p>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">
      IMB Basketball Training
    </p>
  </div>
</body>
</html>`;
}

function buildOwnerNotificationHtml(booking: BookingEmailData): string {
  const date = formatDate(booking.date);
  const amount = formatCurrency(booking.paymentAmount);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;">
      <div style="background:#111827;padding:24px 32px;">
        <h1 style="color:#ffffff;font-size:18px;font-weight:700;margin:0;">New Booking Received</h1>
      </div>
      <div style="padding:32px;">
        <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Confirmation</td>
              <td style="padding:6px 0;color:#2979FF;font-size:13px;font-weight:700;text-align:right;">${booking.confirmationNumber}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Player</td>
              <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${booking.playerFirstName} ${booking.playerLastName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Session</td>
              <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${booking.sessionName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Date</td>
              <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${date}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Time</td>
              <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${booking.sessionTime}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Amount</td>
              <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:700;text-align:right;">${amount}</td>
            </tr>
          </table>
        </div>
        <h3 style="color:#111827;font-size:14px;font-weight:700;margin:0 0 12px;">Parent / Guardian</h3>
        <div style="background:#f9fafb;border-radius:12px;padding:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Name</td>
              <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${booking.parentName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Email</td>
              <td style="padding:6px 0;color:#2979FF;font-size:13px;text-align:right;"><a href="mailto:${booking.parentEmail}" style="color:#2979FF;text-decoration:none;">${booking.parentEmail}</a></td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Phone</td>
              <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${booking.parentPhone}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
