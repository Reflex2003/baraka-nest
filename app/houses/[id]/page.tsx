import { notFound } from "next/navigation";
import HouseDetailClient from "./house-detail-client";

const houses = {
  "kilimani-modern-studios": {
    name: "Kilimani Modern Studios",
    location: "Kilimani, Nairobi",
    distance: "1.2 km from campus",
    price: 12500,
    type: "Studio",
    rooms: "1 bedroom",
    available: 4,
    rating: "4.8",
    description:
      "Modern student-friendly studios in a convenient Kilimani location, designed for students who want privacy, comfort and easy access to everyday essentials.",
    amenities: [
      "24/7 security",
      "Reliable water",
      "Wi-Fi available",
      "Secure parking",
      "CCTV",
      "Laundry area",
      "Prepaid electricity",
      "Nearby shops",
    ],
  },

  "juja-student-hub": {
    name: "Juja Student Hub",
    location: "Juja, Kiambu",
    distance: "0.8 km from campus",
    price: 7500,
    type: "Bedsitter",
    rooms: "1 room",
    available: 8,
    rating: "4.6",
    description:
      "A student-focused residence close to campus, offering practical spaces, convenient transport access and the essentials needed for everyday student life.",
    amenities: [
      "24/7 security",
      "Reliable water",
      "Wi-Fi available",
      "Secure parking",
      "CCTV",
      "Common area",
      "Prepaid electricity",
      "Nearby shops",
    ],
  },

  "kasarani-green-court": {
    name: "Green Court Residences",
    location: "Kasarani, Nairobi",
    distance: "1.5 km from campus",
    price: 9000,
    type: "Bedsitter",
    rooms: "1 room",
    available: 3,
    rating: "4.7",
    description:
      "Comfortable student accommodation in a well-connected part of Kasarani, with easy access to transport, shopping and nearby campuses.",
    amenities: [
      "24/7 security",
      "Reliable water",
      "Secure parking",
      "CCTV",
      "Laundry area",
      "Prepaid electricity",
      "Nearby shops",
      "Public transport nearby",
    ],
  },

  "rongai-student-living": {
    name: "Rongai Student Living",
    location: "Rongai, Kajiado",
    distance: "2.1 km from campus",
    price: 6500,
    type: "Single Room",
    rooms: "1 room",
    available: 11,
    rating: "4.5",
    description:
      "Affordable student accommodation for students looking for a practical place to live without stretching the budget.",
    amenities: [
      "24/7 security",
      "Reliable water",
      "Secure parking",
      "Laundry area",
      "Prepaid electricity",
      "Nearby shops",
      "Public transport nearby",
      "CCTV",
    ],
  },

  "eldoret-campus-view": {
    name: "Campus View Apartments",
    location: "Eldoret, Uasin Gishu",
    distance: "0.6 km from campus",
    price: 8500,
    type: "Bedsitter",
    rooms: "1 room",
    available: 5,
    rating: "4.9",
    description:
      "A highly convenient student residence located close to campus, giving you more time for school and less time worrying about transport.",
    amenities: [
      "24/7 security",
      "Reliable water",
      "Wi-Fi available",
      "Secure parking",
      "CCTV",
      "Laundry area",
      "Prepaid electricity",
      "Nearby shops",
    ],
  },

  "mombasa-student-haven": {
    name: "Student Haven",
    location: "Mombasa",
    distance: "1.8 km from campus",
    price: 8000,
    type: "Single Room",
    rooms: "1 room",
    available: 6,
    rating: "4.6",
    description:
      "A practical student residence with convenient access to campus, shopping areas and public transport.",
    amenities: [
      "24/7 security",
      "Reliable water",
      "Secure parking",
      "CCTV",
      "Laundry area",
      "Prepaid electricity",
      "Nearby shops",
      "Public transport nearby",
    ],
  },
};

export type House = (typeof houses)[keyof typeof houses];

type HouseId = keyof typeof houses;

export default async function HouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!(id in houses)) {
    notFound();
  }

  const house = houses[id as HouseId];

  return <HouseDetailClient house={house} />;
}

export function generateStaticParams() {
  return Object.keys(houses).map((id) => ({
    id,
  }));
}