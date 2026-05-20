import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Parolă incorectă" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", "true", {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  });
  return response;
}
