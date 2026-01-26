import { auth } from "@/lib/firebase";
import { clearUserCookie } from "@/lib/userCookies";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    (await cookies()).delete("userData");
    return NextResponse.json({ ok: true });
}
