import { requireSession } from "@/lib/auth-session";
import RequestsClient from "./requests-client";

export const dynamic = "force-dynamic";

export default async function RoommateRequestsPage() {
  await requireSession();

  return <RequestsClient />;
}
