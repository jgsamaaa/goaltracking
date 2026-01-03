import { NextResponse } from "next/server";

// Optional: you can wire this later.
// For now it returns a helpful message so the app never breaks.

export async function POST() {
  return NextResponse.json({
    ok: false,
    message: "AI is not wired in this starter yet. Keep it simple — local-only execution mode."
  });
}
