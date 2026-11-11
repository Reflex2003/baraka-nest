import { auth } from "@/lib/better-auth";
import { ensureUserManagementSchema } from "@/lib/db";

export async function GET(request: Request) {
  await ensureUserManagementSchema();
  return auth.handler(request);
}

export async function POST(request: Request) {
  await ensureUserManagementSchema();
  return auth.handler(request);
}
