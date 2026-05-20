import { NextRequest, NextResponse } from "next/server";
import { addRegistration } from "@/lib/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parentName, parentPhone, children } = body;

    if (!parentName || !parentPhone || !children?.length) {
      return NextResponse.json({ error: "Date incomplete" }, { status: 400 });
    }

    const id = await addRegistration({ parentName, parentPhone, children });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
