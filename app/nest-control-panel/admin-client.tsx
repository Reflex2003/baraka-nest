"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { kenyaCounties } from "@/lib/kenya-counties";
import { canonicalHouseType } from "@/lib/house-types";
import { uploadUserFile } from "@/lib/client-upload";
import { displayProfileList, formatJoinedAt } from "@/lib/user-management.mjs";
import AnnouncementManager from "./announcement-manager";
import ProfileImageViewer from "@/components/ProfileImageViewer";

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
  is_suspended: number;
  is_verified: number;
  is_deleted: number;
  is_protected: number;
  roommate_profile_id: string | null;
  roommate_profile_is_hidden: number;
  roommate_profile_is_verified: number;
  roommate_profile_name: string | null;
  roommate_profile_age: number | null;
  roommate_profile_school: string | null;
  roommate_profile_gender: string | null;
  roommate_profile_location: string | null;
  roommate_profile_budget: number | null;
  roommate_profile_move_in: string | null;
  roommate_profile_preference: string | null;
  roommate_profile_about: string | null;
  roommate_profile_interests: string | null;
  roommate_profile_lifestyle: string | null;
  roommate_profile_created_at: string | null;
  owned_listing_count: number;
  activity_message_count: number;
};

type Report = {
  id: string;
  category: string;
  details: string;
  status: string;
  created_at: string;
  reported_name: string;
  reporter_name: string;
};

type Review = {
  id: string;
  house_id: string;
  user_id: string;
  username: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
  updated_at: string;
  house_name: string | null;
};

type House = {
  id: string;
  name: string;
  location: string;
  county: string;
  price: number;
  deposit: number;
  monthlyBills: number;
  type: string;
  rooms: string;
  available: number;
  description: string;
  amenities: string[];
  distance: string;
  coordinates: {
    lat: number | "";
    lon: number | "";
  } | null;
  hidden: boolean;
  featured: boolean;
  ownerUserId: string | null;
  contactPhone: string;
  verificationStatus: string;
  ownerName: string | null;
  ownerMemberSince: string | null;
  ownerListingCount: number;
};

type HouseReport = {
  id: string; house_id: string; category: string; details: string; status: string;
  created_at: string; house_name: string | null; location: string | null; reporter_name: string;
};

type AdminData = {
  users: User[];
  totalUsers: number;
  reports: Report[];
  reviews: Review[];
  openReports: number;
  roommateProfiles: number;
  houses: House[];
  houseReports: HouseReport[];
  loadedAt: string;
};

type AdminProfile = {
  id: string;
  name: string;
  image: string | null;
};

type HouseImage = {
  id: string;
  houseId: string;
  url: string;
  blobPath: string;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
  contentType?: string;
  size?: number;
};

type HouseForm = Omit<
  House,
  "id" | "hidden" | "featured" | "ownerUserId" | "verificationStatus" | "contactPhone" | "ownerName" | "ownerMemberSince" | "ownerListingCount"
> & {
  id?: string;
};

const emptyHouseForm: HouseForm = {
  name: "",
  location: "",
  county: "",
  price: 8000,
  deposit: 0,
  monthlyBills: 0,
  type: "Bedsitter/Studio",
  rooms: "1 room",
  available: 1,
  description: "",
  amenities: [],
  distance: "",
  coordinates: {
    lat: -1.2864,
    lon: 36.8172,
  },
};

const panel =
  "rounded-3xl border border-[#e5ebe3] bg-white p-5 shadow-[0_10px_30px_rgba(24,59,44,0.04)] sm:p-6";

const button =
  "min-h-10 rounded-full border border-[#dce5db] px-4 text-xs font-bold text-[#355342] transition hover:bg-[#f3f6f1] disabled:opacity-50";

export default function AdminClient() {
  const [data, setData] = useState<AdminData | null>(null);
  const [adminProfile, setAdminProfile] =
    useState<AdminProfile | null>(null);
  const [error, setError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [busy, setBusy] = useState("");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [houseForm, setHouseForm] =
    useState<HouseForm>(emptyHouseForm);

  const [photoHouseId, setPhotoHouseId] =
    useState<string | null>(null);
  const [houseImages, setHouseImages] =
    useState<HouseImage[]>([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoNotice, setPhotoNotice] = useState("");
  const [pendingHousePhotos, setPendingHousePhotos] = useState<File[]>([]);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const adminProfileImage = adminProfile?.image || "/admin-profile.jpg";

  const refresh = useCallback(async () => {
    setError("");

    try {
      const response = await fetch(`/api/admin?userSearch=${encodeURIComponent(userSearch)}`, {
        cache: "no-store",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Could not load platform controls.",
        );
      }

      setData(result as AdminData);
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : "Could not load platform controls.",
      );
    }
  }, [userSearch]);

  const loadAdminProfile = useCallback(async () => {
    setAvatarError("");

    try {
      const response = await fetch("/api/admin/profile", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Could not load admin profile.",
        );
      }

      setAdminProfile(result as AdminProfile);
    } catch (issue) {
      setAvatarError(
        issue instanceof Error
          ? issue.message
          : "Could not load admin profile.",
      );
    }
  }, []);

  const loadHouseImages = useCallback(
    async (houseId: string) => {
      setPhotoLoading(true);
      setPhotoError("");

      try {
        const response = await fetch(
          `/api/admin/houses/${encodeURIComponent(houseId)}`,
          {
            cache: "no-store",
            credentials: "include",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Could not load house photos.",
          );
        }

        setHouseImages(
          Array.isArray(result.images)
            ? (result.images as HouseImage[])
            : [],
        );
      } catch (issue) {
        setPhotoError(
          issue instanceof Error
            ? issue.message
            : "Could not load house photos.",
        );
        setHouseImages([]);
      } finally {
        setPhotoLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), userSearch ? 300 : 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, [refresh, userSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAdminProfile(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAdminProfile]);

  async function update(
    payload: Record<string, unknown>,
    label: string,
    method = "PATCH",
    afterCreate?: (id: string) => Promise<void>,
  ) {
    setBusy(label);
    setNotice("");
    setError("");

    try {
      const response = await fetch("/api/admin", {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "That update could not be saved.",
        );
      }

      const savedHouseId = typeof result.id === "string"
        ? result.id
        : payload.action === "house-update" && typeof payload.id === "string"
          ? payload.id
          : "";
      if (savedHouseId && afterCreate) {
        await afterCreate(savedHouseId);
      }

      setNotice("Platform update saved.");

      if (
        payload.action === "house-update" ||
        method === "POST"
      ) {
        setHouseForm(emptyHouseForm);
        setPhotoHouseId(null);
        setHouseImages([]);
        setPhotoError("");
        setPhotoNotice("");
        setPendingHousePhotos([]);
      }

      await refresh();
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : "That update could not be saved.",
      );
    } finally {
      setBusy("");
    }
  }

  async function uploadAdminAvatar(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarBusy(true);
    setAvatarError("");
    setNotice("");

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error(
          "Please choose an image file.",
        );
      }

      if (file.size > 4 * 1024 * 1024) {
        throw new Error(
          "Avatar must be 4MB or smaller.",
        );
      }

      if (!adminProfile?.id) throw new Error("Admin profile is still loading. Try again.");
      const formData = new FormData();
      formData.set("avatar", file);
      const response = await fetch("/api/admin/avatar", { method: "POST", body: formData, credentials: "include" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Could not upload admin avatar.",
        );
      }

      setAdminProfile((current) => ({
        id: current?.id || "",
        name: current?.name || "Baraka Nest Admin",
        image: result.avatarUrl || null,
      }));

      setNotice("Admin profile picture updated.");
    } catch (issue) {
      setAvatarError(
        issue instanceof Error
          ? issue.message
          : "Could not upload admin avatar.",
      );
    } finally {
      setAvatarBusy(false);

      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  }

  async function removeAdminAvatar() {
    if (
      !window.confirm(
        "Remove the admin profile picture?",
      )
    ) {
      return;
    }

    setAvatarBusy(true);
    setAvatarError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/avatar", {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Could not remove admin avatar.",
        );
      }

      setAdminProfile((current) => ({
        id: current?.id || "",
        name: current?.name || "Baraka Nest Admin",
        image: null,
      }));

      setNotice("Admin profile picture removed.");
    } catch (issue) {
      setAvatarError(
        issue instanceof Error
          ? issue.message
          : "Could not remove admin avatar.",
      );
    } finally {
      setAvatarBusy(false);
    }
  }

  function editHouse(house: House) {
    setHouseForm({
      id: house.id,
      name: house.name,
      location: house.location,
      county: house.county,
      price: house.price,
      deposit: house.deposit ?? 0,
      monthlyBills: house.monthlyBills ?? 0,
      type: canonicalHouseType(house.type),
      rooms: house.rooms,
      available: house.available,
      description: house.description,
      amenities: house.amenities,
      distance: house.distance,
      coordinates: house.coordinates,
    });

    setPhotoHouseId(house.id);
    setHouseImages([]);
    setPhotoError("");
    setPhotoNotice("");

    void loadHouseImages(house.id);

    document
      .getElementById("house-editor")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }

  function submitHouse(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const editing = Boolean(houseForm.id);

    const photosToUpload = [...pendingHousePhotos];

    void update(
      {
        ...(editing
          ? {
              action: "house-update",
              id: houseForm.id,
            }
          : {}),
        name: houseForm.name,
        location: houseForm.location,
        county: houseForm.county,
        price: Number(houseForm.price),
        deposit: Number(houseForm.deposit),
        monthlyBills: Number(houseForm.monthlyBills),
        type: houseForm.type,
        rooms: houseForm.rooms,
        available: Number(houseForm.available),
        description: houseForm.description,
        amenities: houseForm.amenities,
        distance: houseForm.distance,
        lat: houseForm.coordinates?.lat === "" || !houseForm.coordinates ? null : Number(houseForm.coordinates.lat),
        lon: houseForm.coordinates?.lon === "" || !houseForm.coordinates ? null : Number(houseForm.coordinates.lon),
      },
      editing ? houseForm.id! : "new-house",
      editing ? "PATCH" : "POST",
      async (savedHouseId) => {
        setHouseForm((current) => ({ ...current, id: savedHouseId }));
        setPhotoHouseId(savedHouseId);
        if (photosToUpload.length) {
          setPendingHousePhotos([]);
          await uploadHousePhotoFiles(savedHouseId, photosToUpload);
        }
      },
    );
  }

  async function uploadHouseImages(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length || !photoHouseId) {
      return;
    }

    setPhotoBusy(true);
    setPhotoError("");
    setPhotoNotice("");

    try {
      if (houseImages.length + files.length > 4) {
        throw new Error(
          "A house listing can have a maximum of 4 media files total.",
        );
      }

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error(
            `"${file.name}" is not an image file.`,
          );
        }

        if (file.size > 25 * 1024 * 1024) {
          throw new Error(
            `"${file.name}" is larger than 25MB.`,
          );
        }
      }

      await uploadHousePhotoFiles(photoHouseId, files);
      setPhotoNotice(`${files.length} photo${files.length === 1 ? "" : "s"} uploaded successfully.`);
    } catch (issue) {
      setPhotoError(
        issue instanceof Error
          ? issue.message
          : "Could not upload house photos.",
      );
    } finally {
      setPhotoBusy(false);

      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    }
  }

  async function uploadHousePhotoFiles(houseId: string, files: File[]) {
    for (const file of files) {
      const blob = await uploadUserFile(file, { kind: "house-image", houseId });
      const response = await fetch("/api/uploads/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "house-image",
          houseId,
          url: blob.url,
          pathname: blob.pathname,
          contentType: file.type,
          size: file.size,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Could not save ${file.name}.`);
    }

    await loadHouseImages(houseId);
  }

  async function setCoverPhoto(imageId: string) {
    if (!photoHouseId) {
      return;
    }

    setPhotoBusy(true);
    setPhotoError("");
    setPhotoNotice("");

    try {
      const response = await fetch(
        `/api/admin/houses/${encodeURIComponent(photoHouseId)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "set-cover",
            imageId,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Could not set the cover photo.",
        );
      }

      setHouseImages(
        Array.isArray(result.images)
          ? (result.images as HouseImage[])
          : [],
      );

      setPhotoNotice("Cover photo updated.");
    } catch (issue) {
      setPhotoError(
        issue instanceof Error
          ? issue.message
          : "Could not set the cover photo.",
      );
    } finally {
      setPhotoBusy(false);
    }
  }

  async function deleteHouseImage(image: HouseImage) {
    if (!photoHouseId) {
      return;
    }

    if (
      !window.confirm(
        image.isCover
          ? "Delete the cover photo? The next available photo will become the cover."
          : "Delete this house photo permanently?",
      )
    ) {
      return;
    }

    setPhotoBusy(true);
    setPhotoError("");
    setPhotoNotice("");

    try {
      const response = await fetch(
        `/api/admin/houses/${encodeURIComponent(photoHouseId)}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageId: image.id,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Could not delete the house photo.",
        );
      }

      setHouseImages(
        Array.isArray(result.images)
          ? (result.images as HouseImage[])
          : [],
      );

      setPhotoNotice("House photo deleted.");
    } catch (issue) {
      setPhotoError(
        issue instanceof Error
          ? issue.message
          : "Could not delete the house photo.",
      );
    } finally {
      setPhotoBusy(false);
    }
  }

  async function moveHouseImage(
    imageId: string,
    direction: "left" | "right",
  ) {
    if (!photoHouseId) {
      return;
    }

    const currentIndex = houseImages.findIndex(
      (image) => image.id === imageId,
    );

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "left"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= houseImages.length
    ) {
      return;
    }

    const reordered = [...houseImages];
    const [movingImage] = reordered.splice(
      currentIndex,
      1,
    );

    reordered.splice(targetIndex, 0, movingImage);

    const payload = reordered.map(
      (image, index) => ({
        id: image.id,
        sortOrder: index,
      }),
    );

    setPhotoBusy(true);
    setPhotoError("");
    setPhotoNotice("");

    try {
      const response = await fetch(
        `/api/admin/houses/${encodeURIComponent(photoHouseId)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "reorder",
            images: payload,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Could not reorder house photos.",
        );
      }

      setHouseImages(
        Array.isArray(result.images)
          ? (result.images as HouseImage[])
          : [],
      );

      setPhotoNotice("Photo order updated.");
    } catch (issue) {
      setPhotoError(
        issue instanceof Error
          ? issue.message
          : "Could not reorder house photos.",
      );
    } finally {
      setPhotoBusy(false);
    }
  }

  function reviewStars(rating: number) {
    return "★".repeat(
      Math.max(0, Math.min(5, rating)),
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-4 py-7 text-[#183b2c] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#e58b45]">
              Private platform controls
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
              Baraka Nest admin
            </h1>

            <p className="mt-2 text-sm text-[#718077]">
              Manage reports, listings, reviews and roommate
              visibility.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className={button}
              onClick={() => {
                void refresh();
                void loadAdminProfile();

                if (photoHouseId) {
                  void loadHouseImages(photoHouseId);
                }
              }}
            >
              Refresh
            </button>

            <Link
              href="/dashboard"
              className={`${button} inline-flex items-center`}
            >
              Student dashboard
            </Link>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}

            <button
              className="ml-2 font-bold underline"
              onClick={() => void refresh()}
            >
              Retry
            </button>
          </div>
        )}

        {notice && (
          <p
            role="status"
            className="mb-5 rounded-2xl bg-[#eaf2e8] px-4 py-3 text-sm font-semibold text-[#285640]"
          >
            {notice}
          </p>
        )}

        {!data && !error && (
          <div
            className={`${panel} animate-pulse text-sm text-[#718077]`}
          >
            Loading platform controls…
          </div>
        )}

        {data && (
          <>
            <section
              className="mb-6 grid gap-3 sm:grid-cols-4"
              aria-label="Platform overview"
            >
              {[
                ["User accounts", data.totalUsers],
                [
                  "Roommate profiles",
                  data.roommateProfiles,
                ],
                ["Open reports", data.openReports],
                ["Reviews", data.reviews.length],
              ].map(([label, value]) => (
                <article key={label} className={panel}>
                  <p className="text-sm font-semibold text-[#718077]">
                    {label}
                  </p>

                  <p className="mt-2 text-3xl font-extrabold">
                    {value}
                  </p>
                </article>
              ))}
            </section>

            <section className={`${panel} mb-6`}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <ProfileImageViewer src={adminProfileImage} alt="Admin profile picture" className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-[#eaf2e8] bg-[#183b2c] shadow-sm">
                    <Image src={adminProfileImage} alt="Admin profile" fill sizes="80px" unoptimized className="object-cover object-[center_28%]" />
                  </ProfileImageViewer>

                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#e58b45]">
                      Admin profile
                    </p>

                    <h2 className="mt-1 text-xl font-extrabold">
                      {adminProfile?.name ||
                        "Baraka Nest Admin"}
                    </h2>

                    <p className="mt-1 text-sm text-[#718077]">
                      This picture appears wherever Baraka Nest
                      presents the platform admin.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={uploadAdminAvatar}
                    className="sr-only"
                    id="admin-avatar-upload"
                  />

                  <label
                    htmlFor="admin-avatar-upload"
                    className={`${button} inline-flex cursor-pointer items-center justify-center ${
                      avatarBusy
                        ? "pointer-events-none"
                        : ""
                    }`}
                  >
                    {avatarBusy
                      ? "Uploading…"
                      : "Upload picture"}
                  </label>

                  {adminProfile?.image && adminProfile.image !== "/admin-profile.jpg" && (
                    <button
                      type="button"
                      className={`${button} text-red-700`}
                      disabled={avatarBusy}
                      onClick={() =>
                        void removeAdminAvatar()
                      }
                    >
                      Remove picture
                    </button>
                  )}
                </div>
              </div>

              {avatarError && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-800"
                >
                  {avatarError}
                </p>
              )}

              <p className="mt-4 text-[11px] leading-5 text-[#87938b]">
                JPG, PNG, WEBP and other browser-supported image
                formats are accepted up to 20MB. Only the
                super-admin can change this picture.
              </p>
            </section>

            <AnnouncementManager />

            <section
              id="house-editor"
              className={`${panel} mb-6`}
            >
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">
                    {houseForm.id
                      ? "Edit a housing listing"
                      : "Add a housing listing"}
                  </h2>

                  <p className="mt-1 text-sm text-[#718077]">
                    Listings are saved in Turso and appear in
                    housing search. Enter a map point in Kenya.
                  </p>
                </div>

                {houseForm.id && (
                  <button
                    type="button"
                    className={button}
                    onClick={() => {
                      setHouseForm(emptyHouseForm);
                      setPhotoHouseId(null);
                      setHouseImages([]);
                      setPhotoError("");
                      setPhotoNotice("");
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>

              <form
                onSubmit={submitHouse}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                <label className="text-xs font-bold text-[#526258]">
                  House name

                  <input
                    required
                    minLength={3}
                    maxLength={100}
                    value={houseForm.name}
                    onChange={(event) =>
                      setHouseForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal"
                  />
                </label>

                <label className="text-xs font-bold text-[#526258]">
                  Area

                  <input
                    required
                    maxLength={120}
                    value={houseForm.location}
                    onChange={(event) =>
                      setHouseForm((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal"
                  />
                </label>

                <label className="text-xs font-bold text-[#526258]">
                  County

                  <select
                    required
                    value={houseForm.county}
                    onChange={(event) =>
                      setHouseForm((current) => ({
                        ...current,
                        county: event.target.value,
                      }))
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] bg-white px-3 text-sm font-normal"
                  >
                    <option value="">
                      Choose a county
                    </option>

                    {kenyaCounties.map((county) => (
                      <option key={county}>{county}</option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-bold text-[#526258]">
                  Monthly rent (KSh)

                  <input
                    required
                    type="number"
                    min={500}
                    max={1000000}
                    value={houseForm.price}
                    onChange={(event) =>
                      setHouseForm((current) => ({
                        ...current,
                        price: Number(event.target.value),
                      }))
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal"
                  />
                </label>

                <label className="text-xs font-bold text-[#526258]">
                  Deposit (KSh, optional)
                  <input
                    type="number"
                    min={0}
                    max={1000000}
                    value={houseForm.deposit}
                    onChange={(event) => setHouseForm((current) => ({ ...current, deposit: Number(event.target.value) }))}
                    className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal"
                  />
                </label>

                <label className="text-xs font-bold text-[#526258]">
                  Estimated monthly bills (KSh)
                  <input
                    type="number"
                    min={0}
                    max={1000000}
                    value={houseForm.monthlyBills}
                    onChange={(event) => setHouseForm((current) => ({ ...current, monthlyBills: Number(event.target.value) }))}
                    className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal"
                  />
                </label>

                <label className="text-xs font-bold text-[#526258]">
                  Home type
                  <input required maxLength={60} value={houseForm.type} onChange={(event) => setHouseForm((current) => ({ ...current, type: event.target.value }))} className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] bg-white px-3 text-sm font-normal" />
                </label>

                <label className="text-xs font-bold text-[#526258]">
                  Room description

                  <input
                    required
                    maxLength={60}
                    value={houseForm.rooms}
                    onChange={(event) =>
                      setHouseForm((current) => ({
                        ...current,
                        rooms: event.target.value,
                      }))
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal"
                  />
                </label>

                <label className="text-xs font-bold text-[#526258]">
                  Available spaces

                  <input
                    required
                    type="number"
                    min={0}
                    max={1000}
                    value={houseForm.available}
                    onChange={(event) =>
                      setHouseForm((current) => ({
                        ...current,
                        available: Number(event.target.value),
                      }))
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal"
                  />
                </label>

                <label className="text-xs font-bold text-[#526258]">
                  Distance from campus (optional)

                  <input
                    maxLength={100}
                    value={houseForm.distance}
                    onChange={(event) =>
                      setHouseForm((current) => ({
                        ...current,
                        distance: event.target.value,
                      }))
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-bold text-[#526258]">
                    Latitude

                    <input
                      required
                      type="number"
                      min={-5}
                      max={6}
                      step="any"
                      value={houseForm.coordinates?.lat ?? ""}
                      onChange={(event) =>
                        setHouseForm((current) => ({
                          ...current,
                          coordinates: {
                            ...(current.coordinates ?? { lat: "", lon: "" }),
                            lat: event.target.value === "" ? "" : Number(event.target.value),
                          },
                        }))
                      }
                      className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal"
                    />
                  </label>

                  <label className="text-xs font-bold text-[#526258]">
                    Longitude

                    <input
                      required
                      type="number"
                      min={33}
                      max={42}
                      step="any"
                      value={houseForm.coordinates?.lon ?? ""}
                      onChange={(event) =>
                        setHouseForm((current) => ({
                          ...current,
                          coordinates: {
                            ...(current.coordinates ?? { lat: "", lon: "" }),
                            lon: event.target.value === "" ? "" : Number(event.target.value),
                          },
                        }))
                      }
                      className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal"
                    />
                  </label>
                </div>

                <label className="text-xs font-bold text-[#526258] sm:col-span-2">
                  Description

                  <textarea
                    required
                    minLength={20}
                    maxLength={2000}
                    rows={3}
                    value={houseForm.description}
                    onChange={(event) =>
                      setHouseForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-[#dfe6dd] px-3 py-2 text-sm font-normal"
                  />
                </label>

                <label className="text-xs font-bold text-[#526258] sm:col-span-2 lg:col-span-1">
                  Amenities, separated by commas

                  <input
                    value={houseForm.amenities.join(", ")}
                    onChange={(event) =>
                      setHouseForm((current) => ({
                        ...current,
                        amenities: event.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .slice(0, 20),
                      }))
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    disabled={Boolean(busy)}
                    className="min-h-11 w-full rounded-full bg-[#183b2c] px-5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {busy
                      ? "Saving…"
                      : houseForm.id
                        ? "Save changes"
                        : "Publish listing"}
                  </button>
                </div>
              </form>

              {!houseForm.id && (
                <section className="mt-6 rounded-2xl border border-dashed border-[#d7e2d4] bg-[#f7f9f5] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#355342]">
                        Add photos with this new listing
                      </h3>
                      <p className="mt-1 text-xs text-[#718077]">
                        Photos upload after the listing is saved. Up to 4 media files total.
                      </p>
                    </div>
                    <label htmlFor="new-house-photo-upload" className={`${button} inline-flex cursor-pointer items-center`}>
                      Choose photos
                    </label>
                    <input
                      id="new-house-photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        if (files.length > 4 || files.some((file) => !file.type.startsWith("image/") || file.size > 25 * 1024 * 1024)) {
                          setPhotoError("Choose up to 4 image files, each 25MB or smaller.");
                          event.target.value = "";
                          return;
                        }
                        setPhotoError("");
                        setPendingHousePhotos(files);
                      }}
                    />
                  </div>

                  {pendingHousePhotos.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {pendingHousePhotos.map((file, index) => (
                        <li key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-xs">
                          <span className="min-w-0 truncate text-[#526258]">{file.name}</span>
                          <button
                            type="button"
                            className="shrink-0 font-bold text-red-700"
                            onClick={() => setPendingHousePhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {houseForm.id && photoHouseId && (
                <section className="mt-7 border-t border-[#edf0eb] pt-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#e58b45]">
                        Listing photos
                      </p>

                      <h3 className="mt-1 text-xl font-extrabold">
                        Photos for {houseForm.name}
                      </h3>

                      <p className="mt-1 text-sm text-[#718077]">
                        Upload up to 4 media files total. The cover
                        photo is shown first on the public listing.
                      </p>
                    </div>

                    <div>
                      <input
                        ref={photoInputRef}
                        id="house-photo-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={uploadHouseImages}
                        className="sr-only"
                      />

                      <label
                        htmlFor="house-photo-upload"
                        className={`${button} inline-flex cursor-pointer items-center justify-center ${
                          photoBusy
                            ? "pointer-events-none"
                            : ""
                        }`}
                      >
                        {photoBusy
                          ? "Working…"
                          : "Add photos"}
                      </label>
                    </div>
                  </div>

                  {photoError && (
                    <p
                      role="alert"
                      className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-800"
                    >
                      {photoError}
                    </p>
                  )}

                  {photoNotice && (
                    <p
                      role="status"
                      className="mt-4 rounded-xl bg-[#eaf2e8] px-3 py-2 text-xs font-semibold text-[#285640]"
                    >
                      {photoNotice}
                    </p>
                  )}

                  {photoLoading ? (
                    <div className="mt-5 rounded-2xl bg-[#f7f8f4] px-4 py-8 text-center text-sm text-[#718077]">
                      Loading photos…
                    </div>
                  ) : houseImages.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-[#dce5db] bg-[#f7f8f4] px-4 py-8 text-center">
                      <p className="font-bold text-[#355342]">
                        No photos yet
                      </p>

                      <p className="mt-1 text-xs text-[#718077]">
                        Add clear photos of the house, rooms and
                        useful facilities.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {houseImages.map((image, index) => (
                        <article
                          key={image.id}
                          className="overflow-hidden rounded-2xl border border-[#e5ebe3] bg-white"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-[#eef2ec]">
                            <div
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 hover:scale-[1.02]"
                              style={{
                                backgroundImage: `url("${image.url}")`,
                              }}
                              role="img"
                              aria-label={`${houseForm.name} photo ${index + 1}`}
                            />

                            {image.isCover && (
                              <span className="absolute left-3 top-3 rounded-full bg-[#183b2c] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                                Cover photo
                              </span>
                            )}
                          </div>

                          <div className="p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-[#526258]">
                                Photo {index + 1}
                              </p>

                              <button
                                type="button"
                                disabled={
                                  photoBusy ||
                                  image.isCover
                                }
                                className="text-xs font-bold text-[#e58b45] disabled:opacity-40"
                                onClick={() =>
                                  void setCoverPhoto(
                                    image.id,
                                  )
                                }
                              >
                                {image.isCover
                                  ? "Cover"
                                  : "Make cover"}
                              </button>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                disabled={
                                  photoBusy ||
                                  index === 0
                                }
                                className={button}
                                onClick={() =>
                                  void moveHouseImage(
                                    image.id,
                                    "left",
                                  )
                                }
                              >
                                ←
                              </button>

                              <button
                                type="button"
                                disabled={
                                  photoBusy ||
                                  index ===
                                    houseImages.length - 1
                                }
                                className={button}
                                onClick={() =>
                                  void moveHouseImage(
                                    image.id,
                                    "right",
                                  )
                                }
                              >
                                →
                              </button>

                              <button
                                type="button"
                                disabled={photoBusy}
                                className={`${button} text-red-700`}
                                onClick={() =>
                                  void deleteHouseImage(
                                    image,
                                  )
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}

                  <p className="mt-4 text-[11px] leading-5 text-[#87938b]">
                    Media files are stored in Vercel Blob while Turso stores their listing metadata. Maximum 4 total per listing.
                  </p>
                </section>
              )}
            </section>

            <section className={`${panel} mb-6`}>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">
                    Housing listings
                  </h2>

                  <p className="mt-1 text-sm text-[#718077]">
                    Hide a listing or feature it in discovery.
                  </p>
                </div>

                <span className="text-xs text-[#87938b]">
                  {data.houses.length} listings
                </span>
              </div>

              <div className="divide-y divide-[#edf0eb]">
                {data.houses.map((house) => (
                  <div
                    key={house.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-bold">{house.name}</p>

                      <p className="mt-1 text-xs text-[#718077]">
                        {house.location}
                      </p>
                      <p className="mt-1 text-xs text-[#718077]">
                        {house.ownerUserId ? `Listed by ${house.ownerName || "Student"} · ${house.ownerListingCount} listing(s) · Contact: ${house.contactPhone || "Not provided"}` : "Baraka Nest listing"}
                      </p>
                      <p className="mt-1 text-xs font-bold text-[#8b612e]">{house.verificationStatus.replaceAll("_", " ")}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a href={`/houses/${encodeURIComponent(house.id)}`} target="_blank" rel="noreferrer" className={button}>Preview listing</a>
                      {house.verificationStatus !== "verified" && house.verificationStatus !== "suspended" && <button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: "house-status", id: house.id, status: "verified" }, house.id)}>Verify</button>}
                      {house.verificationStatus !== "under_review" && house.verificationStatus !== "suspended" && <button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: "house-status", id: house.id, status: "under_review" }, house.id)}>Under review</button>}
                      {house.verificationStatus !== "suspended" && <button disabled={Boolean(busy)} className={`${button} text-red-700`} onClick={() => void update({ action: "house-status", id: house.id, status: "suspended" }, house.id)}>Suspend</button>}
                      {(house.verificationStatus === "suspended" || house.verificationStatus === "under_review") && <button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: "house-status", id: house.id, status: "unverified" }, house.id)}>Restore as unverified</button>}
                      <button
                        disabled={Boolean(busy)}
                        className={button}
                        onClick={() => editHouse(house)}
                      >
                        Edit details
                      </button>

                      <button
                        disabled={Boolean(busy)}
                        className={button}
                        onClick={() => {
                          editHouse(house);

                          window.setTimeout(() => {
                            document
                              .getElementById("house-editor")
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }, 50);
                        }}
                      >
                        Manage photos
                      </button>

                      <button
                        disabled={Boolean(busy)}
                        className={button}
                        onClick={() =>
                          void update(
                            {
                              action: "house-control",
                              id: house.id,
                              hidden: !house.hidden,
                              featured: house.featured,
                            },
                            house.id,
                          )
                        }
                      >
                        {house.hidden
                          ? "Show listing"
                          : "Hide listing"}
                      </button>

                      <button
                        disabled={Boolean(busy)}
                        className={`${button} ${
                          house.featured
                            ? "border-[#e9b581] bg-[#fff7ed] text-[#98511f]"
                            : ""
                        }`}
                        onClick={() =>
                          void update(
                            {
                              action: "house-control",
                              id: house.id,
                              hidden: house.hidden,
                              featured: !house.featured,
                            },
                            house.id,
                          )
                        }
                      >
                        {house.featured
                          ? "★ Featured"
                          : "Feature listing"}
                      </button>

                      <button
                        disabled={Boolean(busy)}
                        className={`${button} text-red-700`}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Remove ${house.name} and its saved-home records?`,
                            )
                          ) {
                            void update(
                              {
                                action: "house-delete",
                                id: house.id,
                              },
                              house.id,
                            );
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${panel} mb-6`}>
              <div className="mb-4"><h2 className="text-xl font-extrabold">Listing reports</h2><p className="mt-1 text-sm text-[#718077]">Review reports individually. Multiple reports can prompt a review; listings are not removed automatically.</p></div>
              {data.houseReports.length === 0 ? <p className="rounded-2xl bg-[#f7f8f4] px-4 py-6 text-sm text-[#718077]">No listing reports have been submitted.</p> : <div className="space-y-3">{data.houseReports.map((report) => <article key={report.id} className="rounded-2xl border border-[#edf0eb] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{report.house_name || "Unknown listing"} · {report.category.replaceAll("_", " ")} <span className="ml-2 text-xs font-normal">{report.status}</span></p><p className="mt-1 text-xs text-[#718077]">{report.location || ""} · reported by {report.reporter_name} · {new Date(report.created_at).toLocaleDateString()}</p>{report.details && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#526258]">{report.details}</p>}</div><div className="flex flex-wrap gap-2"><a href={`/houses/${encodeURIComponent(report.house_id)}`} target="_blank" rel="noreferrer" className={button}>Review listing</a><button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: "house-status", id: report.house_id, status: "under_review" }, report.house_id)}>Hide for review</button>{report.status === "open" && <><button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: "house-report-status", id: report.id, status: "resolved" }, report.id)}>Resolve</button><button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: "house-report-status", id: report.id, status: "dismissed" }, report.id)}>Dismiss</button></>}</div></div></article>)}</div>}
            </section>

            <section className={`${panel} mb-6`}>
              <div className="mb-4">
                <h2 className="text-xl font-extrabold">
                  Reviews moderation
                </h2>

                <p className="mt-1 text-sm text-[#718077]">
                  Review student feedback and hide or remove
                  inappropriate reviews.
                </p>
              </div>

              {data.reviews.length === 0 ? (
                <p className="rounded-2xl bg-[#f7f8f4] px-4 py-6 text-sm text-[#718077]">
                  No reviews have been submitted yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.reviews.map((review) => (
                    <article
                      key={review.id}
                      className={`rounded-2xl border p-4 ${
                        review.status === "hidden"
                          ? "border-amber-200 bg-amber-50/40"
                          : "border-[#edf0eb] bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold">
                              {review.house_name ||
                                "Unknown listing"}
                            </p>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                review.status === "hidden"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-[#eaf2e8] text-[#285640]"
                              }`}
                            >
                              {review.status}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#718077]">
                            <span>
                              By {review.username || "Student"}
                            </span>

                            <span>
                              {new Date(
                                review.created_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          <p
                            className="mt-3 text-sm font-bold tracking-wide text-[#e58b45]"
                            aria-label={`${review.rating} out of 5 stars`}
                          >
                            {reviewStars(review.rating)}

                            <span className="ml-2 text-xs font-semibold tracking-normal text-[#718077]">
                              {review.rating}/5
                            </span>
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#526258]">
                            {review.comment}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {review.status === "hidden" ? (
                            <button
                              disabled={Boolean(busy)}
                              className={button}
                              onClick={() =>
                                void update(
                                  {
                                    action: "review-unhide",
                                    id: review.id,
                                  },
                                  review.id,
                                )
                              }
                            >
                              Unhide
                            </button>
                          ) : (
                            <button
                              disabled={Boolean(busy)}
                              className={button}
                              onClick={() =>
                                void update(
                                  {
                                    action: "review-hide",
                                    id: review.id,
                                  },
                                  review.id,
                                )
                              }
                            >
                              Hide
                            </button>
                          )}

                          <button
                            disabled={Boolean(busy)}
                            className={`${button} text-red-700`}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Delete this review permanently? This cannot be undone.",
                                )
                              ) {
                                void update(
                                  {
                                    action: "review-delete",
                                    id: review.id,
                                  },
                                  review.id,
                                );
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <p className="mt-4 text-[11px] leading-5 text-[#87938b]">
                Hidden reviews are removed from the public
                house review feed but remain available here for
                moderation. Deleted reviews are permanently
                removed.
              </p>
            </section>

            <section className={`${panel} mb-6`}>
              <div className="mb-4">
                <h2 className="text-xl font-extrabold">
                  Safety reports
                </h2>

                <p className="mt-1 text-sm text-[#718077]">
                  Review concerns submitted by students and
                  record the outcome.
                </p>
              </div>

              {data.reports.length === 0 ? (
                <p className="rounded-2xl bg-[#f7f8f4] px-4 py-6 text-sm text-[#718077]">
                  No reports have been submitted.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.reports.map((report) => (
                    <article
                      key={report.id}
                      className="rounded-2xl border border-[#edf0eb] p-4"
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <div>
                          <p className="font-bold">
                            {report.category.replaceAll("_", " ")}

                            <span className="ml-2 rounded-full bg-[#f1f4ef] px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#718077]">
                              {report.status}
                            </span>
                          </p>

                          <p className="mt-1 text-xs text-[#718077]">
                            {report.reporter_name} reported{" "}
                            {report.reported_name} ·{" "}
                            {new Date(
                              report.created_at,
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        {report.status === "open" && (
                          <div className="flex gap-2">
                            <button
                              disabled={Boolean(busy)}
                              className={button}
                              onClick={() =>
                                void update(
                                  {
                                    action: "report-status",
                                    id: report.id,
                                    status: "resolved",
                                  },
                                  report.id,
                                )
                              }
                            >
                              Resolve
                            </button>

                            <button
                              disabled={Boolean(busy)}
                              className={button}
                              onClick={() =>
                                void update(
                                  {
                                    action: "report-status",
                                    id: report.id,
                                    status: "dismissed",
                                  },
                                  report.id,
                                )
                              }
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>

                      {report.details && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#526258]">
                          {report.details}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className={panel}>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold">User management</h2>
                  <p className="mt-1 text-sm text-[#718077]">
                    Manage main accounts and roommate visibility as separate items.
                  </p>
                </div>
                <label className="grid gap-1 text-xs font-bold text-[#526258]">
                  Search users
                  <input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Name, username, email or ID"
                    className="min-h-10 w-full rounded-xl border border-[#dce5db] px-3 text-sm font-normal sm:w-72"
                  />
                </label>
              </div>

              {data.users.length === 0 ? (
                <p className="text-sm text-[#718077]">No accounts match this search.</p>
              ) : (
                <div className="space-y-3">
                  {data.users.map((user) => {
                    const suspended = Number(user.is_suspended) === 1;
                    const verified = Number(user.is_verified) === 1;
                    const deleted = Number(user.is_deleted) === 1;
                    const protectedAccount = Number(user.is_protected) === 1;
                    const hasRoommate = Boolean(user.roommate_profile_id);
                    const profileHidden = Number(user.roommate_profile_is_hidden) === 1;
                    const profileVerified = Number(user.roommate_profile_is_verified) === 1;
                    const expanded = expandedUserId === user.id;
                    return (
                      <article key={user.id} className="rounded-2xl border border-[#edf0eb] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-[220px] flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold">{user.name || "Student"}</p>
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${suspended ? "bg-red-50 text-red-700" : "bg-[#eaf2e8] text-[#285640]"}`}>
                                {deleted ? "Deleted · anonymized" : suspended ? "Suspended" : "Active"}
                              </span>
                              {verified && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">Verified</span>}
                              {protectedAccount && <span className="rounded-full bg-[#fff4e8] px-2.5 py-1 text-[11px] font-bold text-[#9a5a20]">Protected admin</span>}
                            </div>
                            <p className="mt-1 text-xs text-[#718077]">@{user.username || "—"} · {user.email}</p>
                            <p className="mt-1 text-xs text-[#718077]">Joined: {formatJoinedAt(user.createdAt)}</p>
                            <p className="mt-1 text-xs text-[#718077]">
                              Roommate profile: {hasRoommate ? (profileHidden ? "Hidden" : "Visible") : "None"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button disabled={Boolean(busy)} className={button} onClick={() => setExpandedUserId(expanded ? null : user.id)}>
                              {expanded ? "Hide details" : "View details"}
                            </button>
                            {!protectedAccount && !deleted && (suspended ? (
                              <button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: "user-unsuspend", id: user.id }, user.id)}>Unsuspend account</button>
                            ) : (
                              <button disabled={Boolean(busy)} className={button} onClick={() => {
                                if (window.confirm(`Suspend ${user.username || user.name}'s main account? Their active sessions will be signed out. Their roommate profile will remain stored.`)) {
                                  void update({ action: "user-suspend", id: user.id }, user.id);
                                }
                              }}>Suspend account</button>
                            ))}
                            {!protectedAccount && !deleted && <button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: verified ? "user-unverify" : "user-verify", id: user.id }, user.id)}>{verified ? "Remove verification" : "Verify account"}</button>}
                            {!protectedAccount && !deleted && <button disabled={Boolean(busy)} className={button} onClick={() => { const name = window.prompt("Update the account display name:", user.name); if (name?.trim()) void update({ action: "user-rename", id: user.id, name: name.trim() }, user.id); }}>Edit name</button>}
                            {!protectedAccount && !deleted && <button disabled={Boolean(busy)} className={`${button} text-red-700`} onClick={() => { if (window.confirm(`Anonymize and delete ${user.username || user.name}'s account? Their owned listings and stable owner reference will remain. Login credentials, sessions and roommate profile will be removed.`)) void update({ action: "user-delete", id: user.id }, user.id); }}>Delete main account</button>}
                            {hasRoommate && (
                              <button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: profileHidden ? "roommate-profile-unhide" : "roommate-profile-hide", id: user.roommate_profile_id }, user.id)}>
                                {profileHidden ? "Unhide roommate profile" : "Hide roommate profile"}
                              </button>
                            )}
                            {hasRoommate && !deleted && <button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: profileVerified ? "roommate-profile-unverify" : "roommate-profile-verify", id: user.roommate_profile_id }, user.id)}>{profileVerified ? "Unverify roommate profile" : "Verify roommate profile"}</button>}
                            {hasRoommate && !protectedAccount && (
                              <button disabled={Boolean(busy)} className={`${button} text-red-700`} onClick={() => {
                                if (window.confirm(`Permanently delete only ${user.username || user.name}'s roommate profile? The main account will remain.`)) {
                                  void update({ action: "remove-roommate-profile", id: user.roommate_profile_id }, user.id);
                                }
                              }}>Delete roommate profile</button>
                            )}
                          </div>
                        </div>

                        {expanded && (
                          <div className="mt-4 grid gap-3 border-t border-[#edf0eb] pt-4 text-sm sm:grid-cols-2">
                            <p><span className="font-bold">Account ID:</span> <span className="break-all text-[#718077]">{user.id}</span></p>
                            <p><span className="font-bold">Account status:</span> {suspended ? "Suspended" : "Active"}</p>
                            <p><span className="font-bold">Owned listings:</span> {Number(user.owned_listing_count ?? 0)}</p>
                            <p><span className="font-bold">Messages recorded:</span> {Number(user.activity_message_count ?? 0)}</p>
                            {hasRoommate ? (
                              <div className="sm:col-span-2">
                                <h3 className="font-extrabold">Roommate profile · {profileHidden ? "Hidden" : "Visible"} · {profileVerified ? "Verified" : "Unverified"}</h3>
                                <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                                  <div><dt className="font-bold">Name / age</dt><dd className="text-[#718077]">{user.roommate_profile_name || "—"}{user.roommate_profile_age ? ` · ${user.roommate_profile_age}` : ""}</dd></div>
                                  <div><dt className="font-bold">School / gender</dt><dd className="text-[#718077]">{user.roommate_profile_school || "—"} · {user.roommate_profile_gender || "—"}</dd></div>
                                  <div><dt className="font-bold">Location / monthly budget</dt><dd className="text-[#718077]">{user.roommate_profile_location || "—"} · {user.roommate_profile_budget ? `KSh ${Number(user.roommate_profile_budget).toLocaleString()}` : "—"}</dd></div>
                                  <div><dt className="font-bold">Move-in / preference</dt><dd className="text-[#718077]">{user.roommate_profile_move_in || "—"} · {user.roommate_profile_preference || "—"}</dd></div>
                                  <div><dt className="font-bold">Interests</dt><dd className="text-[#718077]">{displayProfileList(user.roommate_profile_interests)}</dd></div>
                                  <div><dt className="font-bold">Lifestyle</dt><dd className="text-[#718077]">{displayProfileList(user.roommate_profile_lifestyle)}</dd></div>
                                  <div className="sm:col-span-2"><dt className="font-bold">About</dt><dd className="whitespace-pre-wrap text-[#718077]">{user.roommate_profile_about || "—"}</dd></div>
                                  <div><dt className="font-bold">Profile created</dt><dd className="text-[#718077]">{user.roommate_profile_created_at ? formatJoinedAt(user.roommate_profile_created_at) : "—"}</dd></div>
                                  {!protectedAccount && !deleted && <div className="sm:col-span-2"><button type="button" disabled={Boolean(busy)} className={button} onClick={() => { const name = window.prompt("Roommate profile display name:", user.roommate_profile_name || ""); if (!name?.trim()) return; const location = window.prompt("Roommate profile location:", user.roommate_profile_location || ""); if (!location?.trim()) return; const about = window.prompt("Roommate profile about text:", user.roommate_profile_about || ""); if (about === null) return; void update({ action: "roommate-profile-update", id: user.roommate_profile_id, name: name.trim(), location: location.trim(), about: about.trim() }, user.id); }}>Edit roommate profile</button></div>}
                                </dl>
                              </div>
                            ) : <p className="text-[#718077]">This account has no roommate profile. Account management is unaffected.</p>}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

              <p className="mt-5 text-[11px] leading-5 text-[#87938b]">
                Showing {data.users.length} of {data.totalUsers} accounts (up to 250 search results). Joined times use the stored Better Auth timestamp and East Africa Time.
              </p>
            </section>
          </>
        )}

        {data && (
          <p className="mt-5 text-right text-[11px] text-[#87938b]">
            Last loaded{" "}
            {new Date(data.loadedAt).toLocaleString()}
          </p>
        )}
      </div>
    </main>
  );
}
