import { NextResponse } from "next/server";
import admin from "firebase-admin";
if (!admin.apps.length) {
  admin.initializeApp({
    credential:   admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_projectId,
      privateKey: process.env.NEXT_PUBLIC_private_key?.replace(/\\n/g, '\n'),
      clientEmail: process.env.NEXT_PUBLIC_client_email,
    }),
  });
}
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.replace("Bearer ", "");
  try {
    await admin.auth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const url =
    "https://maps.googleapis.com/maps/api/geocode/json" +
    `?address=${encodeURIComponent(address)}` +
    `&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data.results[0].geometry.location);
}
