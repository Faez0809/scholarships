import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Server-only admin passcode check.
 * The passcode lives exclusively in the ADMIN_PIN environment variable.
 * If ADMIN_PIN is not configured, every admin request is rejected.
 */
export function isAdminPinConfigured(): boolean {
  return Boolean(process.env.ADMIN_PIN?.trim());
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function verifyAdminPin(candidate: string | null | undefined): boolean {
  const expected = process.env.ADMIN_PIN?.trim();
  if (!expected || !candidate) return false;
  // Compare fixed-length digests so timing does not leak the passcode length or prefix.
  return timingSafeEqual(digest(candidate.trim()), digest(expected));
}

/**
 * Returns a ready-made error response when the request is not authorized,
 * or null when the caller holds the correct admin passcode.
 */
export function requireAdmin(req: NextRequest): NextResponse | null {
  if (!isAdminPinConfigured()) {
    return NextResponse.json(
      { error: "Admin access is not configured on the server." },
      { status: 503 }
    );
  }
  if (!verifyAdminPin(req.headers.get("x-admin-pin"))) {
    return NextResponse.json(
      { error: "Unauthorized: invalid or missing admin passcode." },
      { status: 401 }
    );
  }
  return null;
}
