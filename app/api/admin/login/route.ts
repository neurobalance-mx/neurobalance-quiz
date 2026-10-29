import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const pw = String(form.get("password") || "");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || pw !== expected) return NextResponse.redirect(new URL("/admin/login?error=1", req.url), 303);
  const res = NextResponse.redirect(new URL("/admin", req.url), 303);
  res.cookies.set(ADMIN_COOKIE, await adminToken(expected), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  return res;
}
