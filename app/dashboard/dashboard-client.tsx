"use client";

import Link from "next/link";
import Navbar from "../navbar";
import { useLanguage } from "../language-context";

type RoommateProfile = {
  id: string;
  username: string;
  name: string;
  age: number;
  school: string;
  location: string;
  budget: number;
  moveIn: string;
  preference: string;
  about: string;
  interests: string[];
  lifestyle: string[];
};

type DashboardClientProps = {
  profile: RoommateProfile | null;
  pendingRequests: number;
  connections: number;
  displayName: string;
  profileCompletion: number;
};

const translations = {
  English: {
    welcome: "Welcome back",
    intro: "Everything you need to find your space and your people.",

    findHouse: "Find a house",
    findHouseDesc: "Explore student-friendly homes.",

    findRoommates: "Find roommates",
    findRoommatesDesc: "Meet students who match your vibe.",

    requests: "Requests",
    pendingRequest: "pending request.",
    pendingRequestsText: "pending requests.",
    pendingRequests: "Pending requests",
    noPending: "No pending roommate requests.",

    connections: "Connections",
    connection: "roommate connection",
    connectionsPlural: "roommate connections",
    noConnections: "You have no connections yet.",

    yourNest: "Your Baraka Nest",
    tagline: "Find your space. Find your people.",

    ready:
      "Your roommate profile is ready. Explore students, connect with people who match your vibe, or find your next home.",

    create:
      "Create your roommate profile to start connecting with students who match your vibe.",

    exploreHouses: "Explore houses",

    profile: "Profile",
    profileStrength: "Profile strength",

    createProfile: "Create your profile",

    complete: "Your profile is complete.",

    improve:
      "complete. Add more details to improve your roommate matches.",

    createProfileDesc:
      "Create a roommate profile to start building your profile.",

    updateProfile: "Update profile →",
    createProfileArrow: "Create profile →",

    yourProfile: "Your profile",
    noProfile: "No roommate profile yet",

    edit: "Edit",

    school: "School",
    location: "Location",
    monthlyBudget: "Monthly budget",
    moveIn: "Move-in",

    noProfileDesc:
      "You haven't created a roommate profile yet. Add your details so other students can discover you and find a better match.",

    activity: "Activity",
    yourNumbers: "Your numbers",

    active: "Active",
    notCreated: "Not created",
  },

  Swahili: {
    welcome: "Karibu tena",
    intro: "Kila kitu unachohitaji kupata nyumba na watu wako.",

    findHouse: "Tafuta nyumba",
    findHouseDesc: "Gundua nyumba zinazofaa wanafunzi.",

    findRoommates: "Tafuta roommates",
    findRoommatesDesc: "Kutana na wanafunzi wanaoendana na wewe.",

    requests: "Maombi",
    pendingRequest: "ombi linalosubiri.",
    pendingRequestsText: "maombi yanayosubiri.",
    pendingRequests: "Maombi yanayosubiri",
    noPending: "Hakuna maombi ya roommate yanayosubiri.",

    connections: "Connections",
    connection: "connection ya roommate",
    connectionsPlural: "connections za roommates",
    noConnections: "Bado huna connections.",

    yourNest: "Baraka Nest Yako",
    tagline: "Pata nyumba yako. Pata watu wako.",

    ready:
      "Profile yako ya roommate iko tayari. Gundua wanafunzi, connect na watu wanaoendana na wewe, au tafuta nyumba yako inayofuata.",

    create:
      "Tengeneza profile yako ya roommate ili uanze ku-connect na wanafunzi wanaoendana na wewe.",

    exploreHouses: "Gundua nyumba",

    profile: "Profile",
    profileStrength: "Nguvu ya profile",

    createProfile: "Tengeneza profile yako",

    complete: "Profile yako imekamilika.",

    improve:
      "imekamilika. Ongeza details zaidi ili kuboresha roommate matches zako.",

    createProfileDesc:
      "Tengeneza profile ya roommate ili uanze kujenga profile yako.",

    updateProfile: "Update profile →",
    createProfileArrow: "Tengeneza profile →",

    yourProfile: "Profile yako",
    noProfile: "Bado huna roommate profile",

    edit: "Edit",

    school: "Chuo",
    location: "Mahali",
    monthlyBudget: "Budget ya mwezi",
    moveIn: "Kuhamia",

    noProfileDesc:
      "Bado hujatengeneza roommate profile. Weka details zako ili wanafunzi wengine wakupate na upate match mzuri.",

    activity: "Activity",
    yourNumbers: "Numbers zako",

    active: "Active",
    notCreated: "Haijatengenezwa",
  },

  Sheng: {
    welcome: "Karibu tena",
    intro: "Everything unadai kupata keja na wasee wako.",

    findHouse: "Tafuta keja",
    findHouseDesc: "Check keja zenye ziko student-friendly.",

    findRoommates: "Tafuta roommates",
    findRoommatesDesc: "Meet wasee wenye mna-match vibe.",

    requests: "Requests",
    pendingRequest: "request iko pending.",
    pendingRequestsText: "requests ziko pending.",
    pendingRequests: "Requests ziko pending",
    noPending: "Hakuna roommate requests ziko pending.",

    connections: "Connections",
    connection: "roommate connection",
    connectionsPlural: "roommate connections",
    noConnections: "Bado huna connections.",

    yourNest: "Baraka Nest Yako",
    tagline: "Pata keja. Pata wasee wako.",

    ready:
      "Roommate profile yako iko ready. Check wasee, connect na wenye mna-match vibe, ama tafuta keja yako next.",

    create:
      "Tengeneza roommate profile yako uanze ku-connect na wasee wenye mna-match vibe.",

    exploreHouses: "Check keja",

    profile: "Profile",
    profileStrength: "Profile strength",

    createProfile: "Tengeneza profile",

    complete: "Profile yako iko complete.",

    improve:
      "complete. Ongeza details zenye zitaimprove roommate matches zako.",

    createProfileDesc:
      "Tengeneza roommate profile uanze kujibuild.",

    updateProfile: "Update profile →",
    createProfileArrow: "Tengeneza profile →",

    yourProfile: "Profile yako",
    noProfile: "Bado huna roommate profile",

    edit: "Edit",

    school: "Chuo",
    location: "Location",
    monthlyBudget: "Budget ya mwezi",
    moveIn: "Move-in",

    noProfileDesc:
      "Bado hujatengeneza roommate profile. Weka details zako wasee wakupate na upate match poa.",

    activity: "Activity",
    yourNumbers: "Numbers zako",

    active: "Active",
    notCreated: "Haijafanywa",
  },
};

export default function DashboardClient({
  profile,
  pendingRequests,
  connections,
  displayName,
  profileCompletion,
}: DashboardClientProps) {
  const { language } = useLanguage();

  const t = translations[language];

  const firstName = displayName.split(" ")[0];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f8f4] px-5 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <section className="mb-8">
            <p className="text-sm font-semibold text-[#e58b45]">
              Baraka Nest
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#183b2c] sm:text-4xl">
              {t.welcome}, {firstName} 👋
            </h1>

            <p className="mt-2 max-w-2xl text-[#647067]">
              {t.intro}
            </p>
          </section>

          {/* QUICK ACTIONS */}
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/houses"
              className="group rounded-3xl bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2ed] text-2xl transition group-hover:scale-105">
                🏠
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#183b2c]">
                {t.findHouse}
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#718078]">
                {t.findHouseDesc}
              </p>
            </Link>

            <Link
              href="/roommates"
              className="group rounded-3xl bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2ed] text-2xl transition group-hover:scale-105">
                🤝
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#183b2c]">
                {t.findRoommates}
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#718078]">
                {t.findRoommatesDesc}
              </p>
            </Link>

            <Link
              href="/roommates/requests"
              className="group relative rounded-3xl bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              {pendingRequests > 0 && (
                <span className="absolute right-5 top-5 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#fff1e7] px-2 text-xs font-bold text-[#d97832]">
                  {pendingRequests}
                </span>
              )}

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1e7] text-2xl transition group-hover:scale-105">
                📩
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#183b2c]">
                {t.requests}
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#718078]">
                {pendingRequests > 0
                  ? `${pendingRequests} ${
                      pendingRequests === 1
                        ? t.pendingRequest
                        : t.pendingRequestsText
                    }`
                  : t.noPending}
              </p>
            </Link>

            <Link
              href="/roommates/connections"
              className="group rounded-3xl bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2ed] text-2xl transition group-hover:scale-105">
                🔗
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#183b2c]">
                {t.connections}
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#718078]">
                {connections > 0
                  ? `${connections} ${
                      connections === 1
                        ? t.connection
                        : t.connectionsPlural
                    }.`
                  : t.noConnections}
              </p>
            </Link>
          </section>

          {/* YOUR NEST */}
          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-[#183b2c] p-7 text-white lg:col-span-2">
              <p className="text-sm font-medium text-[#f2b27b]">
                {t.yourNest}
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {t.tagline}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                {profile ? t.ready : t.create}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/houses"
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#183b2c] transition hover:bg-[#f2f4ef]"
                >
                  {t.exploreHouses}
                </Link>

                <Link
                  href={profile ? "/roommates" : "/roommates/create"}
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {profile
                    ? t.findRoommates
                    : t.createProfile}
                </Link>
              </div>
            </div>

            {/* PROFILE STRENGTH */}
            <div className="rounded-3xl bg-white p-7 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#718078]">
                    {t.profile}
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-[#183b2c]">
                    {profile
                      ? t.profileStrength
                      : t.createProfile}
                  </h2>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf2ed] text-sm font-bold text-[#183b2c]">
                  {profileCompletion}%
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#edf0eb]">
                <div
                  className="h-full rounded-full bg-[#e58b45] transition-all duration-500"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm text-[#718078]">
                {profile
                  ? profileCompletion === 100
                    ? t.complete
                    : `${profileCompletion}% ${t.improve}`
                  : t.createProfileDesc}
              </p>

              <Link
                href="/roommates/create"
                className="mt-5 inline-block text-sm font-semibold text-[#183b2c] transition hover:text-[#e58b45]"
              >
                {profile
                  ? t.updateProfile
                  : t.createProfileArrow}
              </Link>
            </div>
          </section>

          {/* PROFILE + NUMBERS */}
          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-7 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#718078]">
                    {t.yourProfile}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#183b2c]">
                    {profile
                      ? profile.name
                      : t.noProfile}
                  </h2>
                </div>

                {profile && (
                  <Link
                    href="/roommates/create"
                    className="text-sm font-semibold text-[#183b2c] transition hover:text-[#e58b45]"
                  >
                    {t.edit}
                  </Link>
                )}
              </div>

              {profile ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#f7f8f4] p-4">
                    <p className="text-xs font-medium text-[#8a948d]">
                      {t.school}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                      {profile.school}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f7f8f4] p-4">
                    <p className="text-xs font-medium text-[#8a948d]">
                      {t.location}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                      {profile.location}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f7f8f4] p-4">
                    <p className="text-xs font-medium text-[#8a948d]">
                      {t.monthlyBudget}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                      KSh{" "}
                      {profile.budget.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f7f8f4] p-4">
                    <p className="text-xs font-medium text-[#8a948d]">
                      {t.moveIn}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                      {profile.moveIn}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-[#dfe4dc] bg-[#fafbf9] p-6">
                  <p className="text-sm leading-6 text-[#718078]">
                    {t.noProfileDesc}
                  </p>

                  <Link
                    href="/roommates/create"
                    className="mt-5 inline-block rounded-full bg-[#183b2c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285640]"
                  >
                    {t.createProfile}
                  </Link>
                </div>
              )}
            </div>

            {/* NUMBERS */}
            <div className="rounded-3xl bg-white p-7 shadow-sm">
              <p className="text-sm font-medium text-[#718078]">
                {t.activity}
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#183b2c]">
                {t.yourNumbers}
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-[#f7f8f4] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📩</span>

                    <span className="text-sm font-semibold text-[#183b2c]">
                      {t.pendingRequests}
                    </span>
                  </div>

                  <span className="text-lg font-bold text-[#e58b45]">
                    {pendingRequests}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#f7f8f4] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔗</span>

                    <span className="text-sm font-semibold text-[#183b2c]">
                      {t.connections}
                    </span>
                  </div>

                  <span className="text-lg font-bold text-[#183b2c]">
                    {connections}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#f7f8f4] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👤</span>

                    <span className="text-sm font-semibold text-[#183b2c]">
                      {t.profile}
                    </span>
                  </div>

                  <span className="text-sm font-bold text-[#183b2c]">
                    {profile
                      ? t.active
                      : t.notCreated}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}