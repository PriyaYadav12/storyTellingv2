import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { token } = body as { token?: string };

  if (!token) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Secret not configured — allow through (local dev without Turnstile)
    return NextResponse.json({ success: true });
  }

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token }),
  });

  const data = (await res.json()) as { success: boolean };
  if (!data.success) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
