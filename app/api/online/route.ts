import { NextResponse } from "next/server";

// In-memory counter — resets on server restart, but accurate while running.
// Stored on the global object so it survives Next.js hot-reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var __onlineCount: number;
}
if (typeof globalThis.__onlineCount === "undefined") {
  globalThis.__onlineCount = 0;
}

export const revalidate = 0;

export async function GET() {
  return NextResponse.json({
    activeUsers: Math.max(0, globalThis.__onlineCount),
  });
}

export async function POST(request: Request) {
  const { action } = await request.json();
  if (action === "join") globalThis.__onlineCount += 1;
  if (action === "leave")
    globalThis.__onlineCount = Math.max(0, globalThis.__onlineCount - 1);
  return NextResponse.json({ activeUsers: globalThis.__onlineCount });
}
