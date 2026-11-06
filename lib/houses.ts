export type HouseListing = {
  id: string;
  name: string;
  location: string;
  county: string;
  distance: string;
  price: number;
  type: string;
  rooms: string;
  available: number;
  rating: string;
  featured: boolean;
  accent: "dark" | "light" | "soft";
  description: string;
  amenities: string[];
  coordinates: { lat: number; lon: number };
};

export const houses: HouseListing[] = [
  {
    id: "kilimani-modern-studios",
    name: "Kilimani Modern Studios",
    location: "Kilimani, Nairobi",
    county: "Nairobi",
    distance: "1.2 km from campus",
    price: 12500,
    type: "Studio",
    rooms: "1 bedroom",
    available: 4,
    rating: "4.8",
    featured: true,
    accent: "dark",
    description: "Modern student-friendly studios in a convenient Kilimani location, with privacy, comfort and easy access to everyday essentials.",
    amenities: ["24/7 security", "Reliable water", "Wi-Fi available", "Secure parking", "CCTV", "Laundry area", "Prepaid electricity", "Nearby shops"],
    coordinates: { lat: -1.2864, lon: 36.7892 },
  },
  {
    id: "juja-student-hub",
    name: "Juja Student Hub",
    location: "Juja, Kiambu",
    county: "Kiambu",
    distance: "0.8 km from campus",
    price: 7500,
    type: "Bedsitter",
    rooms: "1 room",
    available: 8,
    rating: "4.6",
    featured: true,
    accent: "light",
    description: "A student-focused residence close to campus, with practical spaces and convenient access to everyday essentials.",
    amenities: ["24/7 security", "Reliable water", "Wi-Fi available", "Secure parking", "CCTV", "Common area", "Prepaid electricity", "Nearby shops"],
    coordinates: { lat: -1.1013, lon: 37.0144 },
  },
  {
    id: "kasarani-green-court",
    name: "Green Court Residences",
    location: "Kasarani, Nairobi",
    county: "Nairobi",
    distance: "1.5 km from campus",
    price: 9000,
    type: "Bedsitter",
    rooms: "1 room",
    available: 3,
    rating: "4.7",
    featured: false,
    accent: "soft",
    description: "Comfortable student accommodation in a well-connected part of Kasarani, near public transport and shopping.",
    amenities: ["24/7 security", "Reliable water", "Secure parking", "CCTV", "Laundry area", "Prepaid electricity", "Nearby shops", "Public transport nearby"],
    coordinates: { lat: -1.2216, lon: 36.896 },
  },
  {
    id: "rongai-student-living",
    name: "Rongai Student Living",
    location: "Rongai, Kajiado",
    county: "Kajiado",
    distance: "2.1 km from campus",
    price: 6500,
    type: "Single Room",
    rooms: "1 room",
    available: 11,
    rating: "4.5",
    featured: false,
    accent: "light",
    description: "Affordable student accommodation for students looking for a practical place without stretching the budget.",
    amenities: ["24/7 security", "Reliable water", "Secure parking", "Laundry area", "Prepaid electricity", "Nearby shops", "Public transport nearby", "CCTV"],
    coordinates: { lat: -1.3962, lon: 36.7525 },
  },
  {
    id: "eldoret-campus-view",
    name: "Campus View Apartments",
    location: "Eldoret, Uasin Gishu",
    county: "Uasin Gishu",
    distance: "0.6 km from campus",
    price: 8500,
    type: "Bedsitter",
    rooms: "1 room",
    available: 5,
    rating: "4.9",
    featured: true,
    accent: "dark",
    description: "A convenient student residence near campus, with more time for school and less time worrying about transport.",
    amenities: ["24/7 security", "Reliable water", "Wi-Fi available", "Secure parking", "CCTV", "Laundry area", "Prepaid electricity", "Nearby shops"],
    coordinates: { lat: -0.5143, lon: 35.2698 },
  },
  {
    id: "mombasa-student-haven",
    name: "Student Haven",
    location: "Mombasa",
    county: "Mombasa",
    distance: "1.8 km from campus",
    price: 8000,
    type: "Single Room",
    rooms: "1 room",
    available: 6,
    rating: "4.6",
    featured: false,
    accent: "soft",
    description: "A practical student residence with access to campus, shopping areas and public transport.",
    amenities: ["24/7 security", "Reliable water", "Secure parking", "CCTV", "Laundry area", "Prepaid electricity", "Nearby shops", "Public transport nearby"],
    coordinates: { lat: -4.0435, lon: 39.6682 },
  },
];

export function getMapEmbedUrl(house: HouseListing) {
  const { lat, lon } = house.coordinates;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.015}%2C${lat - 0.012}%2C${lon + 0.015}%2C${lat + 0.012}&layer=mapnik&marker=${lat}%2C${lon}`;
}

export function getMapSearchUrl(location: string, place: string) {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${place}, ${location}`)}`;
}
