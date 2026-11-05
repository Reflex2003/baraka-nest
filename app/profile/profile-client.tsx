"use client";

import Link from "next/link";
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
};

const translations = {
  English: {
    brand: "Baraka Nest",
    title: "Your Profile",
    subtitle:
      "Manage your profile and improve your roommate matches.",
    noProfile: "No roommate profile yet",
    school: "School",
    location: "Location",
    editProfile: "Edit profile",
    createProfile: "Create profile",
    progress: "Profile progress",
    progressSubtitle:
      "Complete your details to get better roommate matches.",
    createToStart:
      "Create your roommate profile to get started.",
    completeProfile: "Your profile is complete.",
    progressText:
      "complete. Add more details to improve your matches.",
    basicInfo: "Basic information",
    schoolDetails: "School details",
    housingPreferences: "Housing preferences",
    complete: "Complete",
    addDetails: "Add details",
    aboutYou: "About you",
    age: "Age",
    monthlyBudget: "Monthly budget",
    moveIn: "Move-in",
  },

  Swahili: {
    brand: "Baraka Nest",
    title: "Profile yako",
    subtitle:
      "Simamia profile yako na uboreshe matches zako za roommate.",
    noProfile: "Bado huna profile ya roommate",
    school: "Chuo",
    location: "Eneo",
    editProfile: "Hariri profile",
    createProfile: "Tengeneza profile",
    progress: "Maendeleo ya profile",
    progressSubtitle:
      "Jaza maelezo yako ili upate matches bora za roommate.",
    createToStart:
      "Tengeneza profile yako ya roommate kuanza.",
    completeProfile: "Profile yako imekamilika.",
    progressText:
      "imekamilika. Ongeza maelezo zaidi ili kuboresha matches zako.",
    basicInfo: "Maelezo ya msingi",
    schoolDetails: "Maelezo ya chuo",
    housingPreferences: "Mapendeleo ya nyumba",
    complete: "Imekamilika",
    addDetails: "Ongeza maelezo",
    aboutYou: "Kuhusu wewe",
    age: "Umri",
    monthlyBudget: "Budget ya mwezi",
    moveIn: "Kuhamia",
  },

  Sheng: {
    brand: "Baraka Nest",
    title: "Profile yako",
    subtitle:
      "Manage profile yako na uboost roommate matches zako.",
    noProfile: "Bado huna roommate profile",
    school: "Chuo",
    location: "Area",
    editProfile: "Edit profile",
    createProfile: "Create profile",
    progress: "Progress ya profile",
    progressSubtitle:
      "Jaza details zako upate roommate matches fiti.",
    createToStart:
      "Create roommate profile yako ndio uanze.",
    completeProfile: "Profile yako iko complete.",
    progressText:
      "complete. Add details zaidi uboost matches zako.",
    basicInfo: "Basic info",
    schoolDetails: "Details za chuo",
    housingPreferences: "Housing preferences",
    complete: "Complete",
    addDetails: "Add details",
    aboutYou: "Kuhusu wewe",
    age: "Age",
    monthlyBudget: "Monthly budget",
    moveIn: "Move-in",
  },
};

type Language = keyof typeof translations;

export default function ProfileClient({
  profile,
  completion,
  displayName,
}: ProfileClientProps) {
  const { language } = useLanguage();

  const currentLanguage = language as Language;
  const t = translations[currentLanguage];

  const initial = displayName.charAt(0).toUpperCase();

  const basicInfoComplete = Boolean(
    profile?.name && profile?.age,
  );

  const schoolComplete = Boolean(profile?.school);

  const locationComplete = Boolean(profile?.location);

  const housingComplete = Boolean(
    profile?.budget &&
      profile?.move_in &&
      profile?.preference,
  );

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#e58b45]">
            {t.brand}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#183b2c]">
            {t.title}
          </h1>

          <p className="mt-2 text-[#647067]">
            {t.subtitle}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Profile summary */}
          <section className="rounded-3xl bg-white p-7 shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#183b2c] text-2xl font-bold text-white">
              {initial}
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#183b2c]">
              {displayName}
            </h2>

            <p className="mt-1 text-sm text-[#718078]">
              {profile
                ? `@${profile.username}`
                : t.noProfile}
            </p>

            {profile && (
              <div className="mt-5 space-y-3">

                <div className="rounded-2xl bg-[#f7f8f4] p-4">
                  <p className="text-xs text-[#8a948d]">
                    {t.school}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                    {profile.school}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f8f4] p-4">
                  <p className="text-xs text-[#8a948d]">
                    {t.location}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                    {profile.location}
                  </p>
                </div>

              </div>
            )}

            <Link
              href="/roommates/create"
              className="mt-6 inline-block rounded-full bg-[#183b2c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285640]"
            >
              {profile
                ? t.editProfile
                : t.createProfile}
            </Link>
          </section>

          {/* Profile progress */}
          <section className="rounded-3xl bg-white p-7 shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#183b2c]">
                  {t.progress}
                </h2>

                <p className="mt-1 text-sm text-[#718078]">
                  {t.progressSubtitle}
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#edf2ed] text-sm font-bold text-[#183b2c]">
                {completion}%
              </div>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#edf0eb]">
              <div
                className="h-full rounded-full bg-[#e58b45] transition-all duration-500"
                style={{
                  width: `${completion}%`,
                }}
              />
            </div>

            <p className="mt-3 text-sm text-[#718078]">
              {!profile
                ? t.createToStart
                : completion === 100
                  ? t.completeProfile
                  : `${completion}% ${t.progressText}`}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">

              {/* Basic info */}
              <div className="rounded-2xl border border-[#edf0eb] p-4">
                <span className="text-xl">
                  👤
                </span>

                <p className="mt-2 text-sm font-semibold text-[#183b2c]">
                  {t.basicInfo}
                </p>

                <p
                  className={`mt-1 text-xs font-medium ${
                    basicInfoComplete
                      ? "text-[#4c7a5f]"
                      : "text-[#8a948d]"
                  }`}
                >
                  {basicInfoComplete
                    ? t.complete
                    : t.addDetails}
                </p>
              </div>

              {/* School */}
              <div className="rounded-2xl border border-[#edf0eb] p-4">
                <span className="text-xl">
                  🎓
                </span>

                <p className="mt-2 text-sm font-semibold text-[#183b2c]">
                  {t.schoolDetails}
                </p>

                <p
                  className={`mt-1 text-xs font-medium ${
                    schoolComplete
                      ? "text-[#4c7a5f]"
                      : "text-[#8a948d]"
                  }`}
                >
                  {schoolComplete
                    ? t.complete
                    : t.addDetails}
                </p>
              </div>

              {/* Location */}
              <div className="rounded-2xl border border-[#edf0eb] p-4">
                <span className="text-xl">
                  📍
                </span>

                <p className="mt-2 text-sm font-semibold text-[#183b2c]">
                  {t.location}
                </p>

                <p
                  className={`mt-1 text-xs font-medium ${
                    locationComplete
                      ? "text-[#4c7a5f]"
                      : "text-[#8a948d]"
                  }`}
                >
                  {locationComplete
                    ? t.complete
                    : t.addDetails}
                </p>
              </div>

              {/* Housing */}
              <div className="rounded-2xl border border-[#edf0eb] p-4">
                <span className="text-xl">
                  🏠
                </span>

                <p className="mt-2 text-sm font-semibold text-[#183b2c]">
                  {t.housingPreferences}
                </p>

                <p
                  className={`mt-1 text-xs font-medium ${
                    housingComplete
                      ? "text-[#4c7a5f]"
                      : "text-[#8a948d]"
                  }`}
                >
                  {housingComplete
                    ? t.complete
                    : t.addDetails}
                </p>
              </div>

            </div>
          </section>
        </div>

        {/* About section */}
        {profile && (
          <section className="mt-6 rounded-3xl bg-white p-7 shadow-sm">

            <h2 className="text-xl font-bold text-[#183b2c]">
              {t.aboutYou}
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#647067]">
              {profile.about}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              {/* Age */}
              <div className="rounded-2xl bg-[#f7f8f4] p-4">
                <p className="text-xs text-[#8a948d]">
                  {t.age}
                </p>

                <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                  {profile.age}
                </p>
              </div>

              {/* Budget */}
              <div className="rounded-2xl bg-[#f7f8f4] p-4">
                <p className="text-xs text-[#8a948d]">
                  {t.monthlyBudget}
                </p>

                <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                  KSh{" "}
                  {profile.budget.toLocaleString()}
                </p>
              </div>

              {/* Move in */}
              <div className="rounded-2xl bg-[#f7f8f4] p-4">
                <p className="text-xs text-[#8a948d]">
                  {t.moveIn}
                </p>

                <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                  {profile.move_in}
                </p>
              </div>

            </div>
          </section>
        )}

      </div>
    </main>
  );
}