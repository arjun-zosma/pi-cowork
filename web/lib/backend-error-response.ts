import { NextResponse } from "next/server";
import { isBackendError } from "@/packages/pi-backend/errors";

// Phase 3 compatibility status mapping. Phase 4 assigns the final /api/v1
// statuses; codes without an entry here keep the legacy 500 fallback.
const STATUS_BY_CODE: Record<string, number> = {
  invalid_request: 400,
  access_denied: 403,
  session_not_found: 404,
  session_not_running: 409,
};

export function backendErrorResponse(error: unknown): NextResponse | null {
  if (!isBackendError(error)) return null;
  return NextResponse.json(
    { error: error.message },
    { status: STATUS_BY_CODE[error.code] ?? 500 },
  );
}
