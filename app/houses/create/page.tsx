import { requireSession } from "@/lib/auth-session";
import CreateHouseClient from "./create-house-client";

export const dynamic = "force-dynamic";

export default async function CreateHousePage() {
  await requireSession();
  return <CreateHouseClient />;
}
