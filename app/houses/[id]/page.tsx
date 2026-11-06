import { notFound } from "next/navigation";
import type { HouseListing } from "@/lib/houses";
import { getHouseListing } from "@/lib/house-records";
import HouseDetailClient from "./house-detail-client";

export const dynamic = "force-dynamic";

export type House = HouseListing;

export default async function HouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const house = await getHouseListing(id);
  if (!house) notFound();
  return <HouseDetailClient house={house} />;
}
