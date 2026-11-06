import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/better-auth";
import { isSuperAdminUserId } from "@/lib/admin";
import AdminClient from "./admin-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Platform controls | Baraka Nest",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !(await isSuperAdminUserId(session.user.id))) notFound();
  return <AdminClient />;
}
