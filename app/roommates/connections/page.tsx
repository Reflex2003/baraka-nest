import { requireSession } from "@/lib/auth-session";
import ConnectionsClient from "./connections-client";

export const dynamic = "force-dynamic";

export default async function RoommateConnectionsPage() {
  await requireSession();

  return <ConnectionsClient />;
}
