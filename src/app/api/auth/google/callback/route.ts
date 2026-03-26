import { NextResponse } from "next/server";
import { handleCallback } from "@/lib/google-calendar";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/admin?error=no_code", request.url));
  }

  try {
    await handleCallback(code);
    return NextResponse.redirect(
      new URL("/admin?google=connected", request.url)
    );
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      new URL("/admin?error=google_auth_failed", request.url)
    );
  }
}
