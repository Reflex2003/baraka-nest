import { requireSession } from "@/lib/auth-session";
import ConnectionsClient from "./connections-client";

export default async function RoommateConnectionsPage() {
  await requireSession();

  return <ConnectionsClient />;
}