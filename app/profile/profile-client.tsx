"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { useLanguage } from "../language-context";

type RoommateProfile = {
  id: string;
  username: string;
  name: string;
  age: number;
  school: string;
  location: string;
  budget: number;
  move_in: string;
  preference: string;
  about: string;
  interests: string;
  lifestyle: string;
};

type ProfileClientProps = {
  profile?: RoommateProfile;
  completion: number;
  displayName: string;
  avatarUrl: string | null;
};

const translations = {
  en: {
    title: "My Profile",
    subtitle: "Your Baraka Nest profile",
    noProfile: "You haven't created your roommate profile yet.",
    school: "School",
    location: "Location",
    editProfile: "Edit Profile",
    createProfile: "Create Roommate Profile",
    progress: "Profile Progress",
    progressSubtitle:
      "Complete your profile to help other students know you better.",
    createToStart: "Create your roommate profile to get started.",
    completeProfile: "Complete your profile",
    progressText: "Your profile is",
    basicInfo: "Basic Information",
    schoolDetails: "School Details",
    housingPreferences: "Housing Preferences",
    complete: "Complete",
    addDetails: "Add details",
    aboutYou: "About You",
    age: "Age",
    monthlyBudget: "Monthly Budget",
    moveIn: "Move-in",
    avatar: "Profile Photo",
    changeAvatar: "Change Photo",
    removeAvatar: "Remove Photo",
    uploadAvatar: "Upload Photo",
    avatarHint: "JPG, PNG, WEBP or GIF. Maximum 5MB.",
    uploading: "Uploading...",
    uploadSuccess: "Profile photo updated.",
    removeSuccess: "Profile photo removed.",
    uploadError: "Could not update your profile photo.",
    removeError: "Could not remove your profile photo.",
    confirmRemove: "Remove your profile photo?",
    student: "Student",
    notSet: "Not set",
  },
  sw: {
    title: "Wasifu Wangu",
    subtitle: "Wasifu wako wa Baraka Nest",
    noProfile: "Bado hujatengeneza wasifu wa roommate.",
    school: "Chuo",
    location: "Mahali",
    editProfile: "Hariri Wasifu",
    createProfile: "Tengeneza Wasifu wa Roommate",
    progress: "Maendeleo ya Wasifu",
    progressSubtitle:
      "Kamilisha wasifu wako ili wanafunzi wengine wakujue vizuri.",
    createToStart: "Tengeneza wasifu wako wa roommate kuanza.",
    completeProfile: "Kamilisha wasifu wako",
    progressText: "Wasifu wako uko",
    basicInfo: "Taarifa za Msingi",
    schoolDetails: "Taarifa za Chuo",
    housingPreferences: "Mapendeleo ya Nyumba",
    complete: "Imekamilika",
    addDetails: "Ongeza taarifa",
    aboutYou: "Kuhusu Wewe",
    age: "Umri",
    monthlyBudget: "Bajeti ya Mwezi",
    moveIn: "Kuhamia",
    avatar: "Picha ya Wasifu",
    changeAvatar: "Badilisha Picha",
    removeAvatar: "Ondoa Picha",
    uploadAvatar: "Weka Picha",
    avatarHint: "JPG, PNG, WEBP au GIF. Maximum 5MB.",
    uploading: "Inapakiwa...",
    uploadSuccess: "Picha ya wasifu imesasishwa.",
    removeSuccess: "Picha ya wasifu imeondolewa.",
    uploadError: "Picha ya wasifu haikuweza kusasishwa.",
    removeError: "Picha ya wasifu haikuweza kuondolewa.",
    confirmRemove: "Ondoa picha yako ya wasifu?",
    student: "Mwanafunzi",
    notSet: "Haijawekwa",
  },
  sheng: {
    title: "My Profile",
    subtitle: "Profile yako ya Baraka Nest",
    noProfile: "Bado hujamake roommate profile yako.",
    school: "School",
    location: "Location",
    editProfile: "Edit Profile",
    createProfile: "Make Roommate Profile",
    progress: "Profile Progress",
    progressSubtitle:
      "Malizia profile yako ndio wasee wakujue better.",
    createToStart: "Make roommate profile yako ndio uanze.",
    completeProfile: "Malizia profile yako",
    progressText: "Profile yako iko",
    basicInfo: "Basic Info",
    schoolDetails: "School Details",
    housingPreferences: "Housing Preferences",
    complete: "Complete",
    addDetails: "Ongeza details",
    aboutYou: "About You",
    age: "Age",
    monthlyBudget: "Monthly Budget",
    moveIn: "Move-in",
    avatar: "Profile Photo",
    changeAvatar: "Change Photo",
    removeAvatar: "Remove Photo",
    uploadAvatar: "Upload Photo",
    avatarHint: "JPG, PNG, WEBP ama GIF. Maximum 5MB.",
    uploading: "Uploading...",
    uploadSuccess: "Profile photo imeupdate.",
    removeSuccess: "Profile photo imeondolewa.",
    uploadError: "Profile photo imefail kuupdate.",
    removeError: "Profile photo imefail kuondolewa.",
    confirmRemove: "Uko sure uondoe profile photo?",
    student: "Student",
    notSet: "Haijawekwa",
  },
} as const;

export default function ProfileClient({
  profile,
  completion,
  displayName,
  avatarUrl,
}: ProfileClientProps) {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentAvatar, setCurrentAvatar] = useState<string | null>(
    avatarUrl,
  );
  const [uploading, setUploading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const languageKey =
    String(language) === "sw"
      ? "sw"
      : String(language) === "sheng"
        ? "sheng"
        : "en";

  const t = translations[languageKey];

  const initial =
    displayName.trim().charAt(0).toUpperCase() || "S";

  const basicComplete = Boolean(
    profile?.name &&
      profile?.age &&
      profile?.location,
  );

  const schoolComplete = Boolean(profile?.school);

  const housingComplete = Boolean(
    profile?.budget &&
      profile?.move_in &&
      profile?.preference,
  );

  const aboutComplete = Boolean(profile?.about);

  async function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarMessage("");
    setAvatarError("");

    if (!file.type.startsWith("image/")) {
      setAvatarError(t.uploadError);
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(t.uploadError);
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        success?: boolean;
        avatarUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.success || !data.avatarUrl) {
        throw new Error(data.error || t.uploadError);
      }

      setCurrentAvatar(data.avatarUrl);
      setAvatarMessage(t.uploadSuccess);
    } catch {
      setAvatarError(t.uploadError);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleRemoveAvatar() {
    if (!currentAvatar) {
      return;
    }

    const confirmed = window.confirm(t.confirmRemove);

    if (!confirmed) {
      return;
    }

    setUploading(true);
    setAvatarMessage("");
    setAvatarError("");

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error || t.removeError);
      }

      setCurrentAvatar(null);
      setAvatarMessage(t.removeSuccess);
    } catch {
      setAvatarError(t.removeError);
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {t.title}
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            {t.subtitle}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex shrink-0 flex-col items-center gap-3">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-3xl font-black text-emerald-700 ring-4 ring-emerald-50">
                  {currentAvatar ? (
                    <Image
                      src={currentAvatar}
                      alt={`${displayName} profile`}
                      fill
                      sizes="96px"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploading
                      ? t.uploading
                      : currentAvatar
                        ? t.changeAvatar
                        : t.uploadAvatar}
                  </button>

                  {currentAvatar && !uploading && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:text-red-600"
                    >
                      {t.removeAvatar}
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <p className="max-w-48 text-center text-[11px] leading-4 text-slate-400">
                  {t.avatarHint}
                </p>

                {avatarMessage && (
                  <p className="text-center text-xs font-semibold text-emerald-600">
                    {avatarMessage}
                  </p>
                )}

                {avatarError && (
                  <p className="text-center text-xs font-semibold text-red-600">
                    {avatarError}
                  </p>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-emerald-600">
                  @{profile?.username || "student"}
                </p>

                <h2 className="mt-1 break-words text-2xl font-black">
                  {displayName || t.student}
                </h2>

                {profile ? (
                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-slate-900">
                        {t.school}:
                      </span>
                      <span>{profile.school || t.notSet}</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="font-bold text-slate-900">
                        {t.location}:
                      </span>
                      <span>{profile.location || t.notSet}</span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    {t.noProfile}
                  </p>
                )}

                <div className="mt-6">
                  <Link
                    href="/roommates/create"
                    className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    {profile
                      ? t.editProfile
                      : t.createProfile}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">
                  {t.progress}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {t.progressSubtitle}
                </p>
              </div>

              <span className="text-3xl font-black text-emerald-600">
                {completion}%
              </span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, completion),
                  )}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-500">
              {profile
                ? `${t.progressText} ${completion}% complete.`
                : t.createToStart}
            </p>
          </section>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: t.basicInfo,
              complete: basicComplete,
              details: profile
                ? `${profile.name || t.notSet} · ${profile.age || t.notSet}`
                : t.addDetails,
            },
            {
              title: t.schoolDetails,
              complete: schoolComplete,
              details: profile?.school || t.addDetails,
            },
            {
              title: t.housingPreferences,
              complete: housingComplete,
              details: profile
                ? `${profile.budget || 0} · ${profile.move_in || t.notSet}`
                : t.addDetails,
            },
            {
              title: t.aboutYou,
              complete: aboutComplete,
              details: profile?.about || t.addDetails,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-black">
                  {item.title}
                </h3>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                    item.complete
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.complete
                    ? t.complete
                    : t.addDetails}
                </span>
              </div>

              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                {item.details}
              </p>
            </div>
          ))}
        </section>

        {profile && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black">
              {t.aboutYou}
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {t.age}
                </p>

                <p className="mt-2 text-lg font-black">
                  {profile.age || t.notSet}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {t.monthlyBudget}
                </p>

                <p className="mt-2 text-lg font-black">
                  {profile.budget
                    ? `KES ${profile.budget.toLocaleString()}`
                    : t.notSet}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {t.moveIn}
                </p>

                <p className="mt-2 text-lg font-black">
                  {profile.move_in || t.notSet}
                </p>
              </div>
            </div>

            {profile.about && (
              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <p className="text-sm leading-7 text-slate-600">
                  {profile.about}
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}