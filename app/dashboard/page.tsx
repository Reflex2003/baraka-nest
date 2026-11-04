import Link from "next/link";
import Navbar from "../navbar";
import { auth } from "@/auth";
import { roommateDb } from "@/lib/roommate-db";
import { headers } from "next/headers";

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

type DashboardData = {
  profile: RoommateProfile | null;
  pendingRequests: number;
  connections: number;
};

function calculateProfileCompletion(profile: RoommateProfile | null) {
  if (!profile) {
    return 0;
  }

  const checks = [
    Boolean(profile.name),
    Boolean(profile.age),
    Boolean(profile.school),
    Boolean(profile.location),
    Boolean(profile.budget),
    Boolean(profile.moveIn),
    Boolean(profile.preference),
    Boolean(profile.about),
    profile.interests.length > 0,
    profile.lifestyle.length > 0,
  ];

  const completed = checks.filter(Boolean).length;

  return Math.round((completed / checks.length) * 100);
}

async function getDashboardData(): Promise<DashboardData> {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    return {
      profile: null,
      pendingRequests: 0,
      connections: 0,
    };
  }

  const userId = session.user.id;

  const profileRow = roommateDb
    .prepare(
      `
        SELECT
          id,
          username,
          name,
          age,
          school,
          location,
          budget,
          move_in,
          preference,
          about,
          interests,
          lifestyle
        FROM roommate_profile
        WHERE user_id = ?
        LIMIT 1
      `,
    )
    .get(userId) as
    | {
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
      }
    | undefined;

  const pendingRow = roommateDb
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM connection_request
        WHERE receiver_user_id = ?
          AND status = 'pending'
      `,
    )
    .get(userId) as { count: number };

  const connectionsRow = roommateDb
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM connection_request
        WHERE status = 'accepted'
          AND (
            sender_user_id = ?
            OR receiver_user_id = ?
          )
      `,
    )
    .get(userId, userId) as { count: number };

  const profile = profileRow
    ? {
        id: profileRow.id,
        username: profileRow.username,
        name: profileRow.name,
        age: profileRow.age,
        school: profileRow.school,
        location: profileRow.location,
        budget: profileRow.budget,
        moveIn: profileRow.move_in,
        preference: profileRow.preference,
        about: profileRow.about,
        interests: JSON.parse(profileRow.interests) as string[],
        lifestyle: JSON.parse(profileRow.lifestyle) as string[],
      }
    : null;

  return {
    profile,
    pendingRequests: pendingRow.count,
    connections: connectionsRow.count,
  };
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const data = await getDashboardData();

  const profile = data.profile;

 const displayName =
  profile?.name ||
  session?.user.name ||
  "Student";

  const profileCompletion = calculateProfileCompletion(profile);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f8f4] px-5 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <section className="mb-8">
            <p className="text-sm font-semibold text-[#e58b45]">
              Baraka Nest
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#183b2c] sm:text-4xl">
              Welcome back, {displayName.split(" ")[0]} 👋
            </h1>

            <p className="mt-2 max-w-2xl text-[#647067]">
              Everything you need to find your space and your people.
            </p>
          </section>

          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/houses"
              className="group rounded-3xl bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2ed] text-2xl transition group-hover:scale-105">
                🏠
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#183b2c]">
                Find a house
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#718078]">
                Explore student-friendly homes.
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
                Find roommates
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#718078]">
                Meet students who match your vibe.
              </p>
            </Link>

            <Link
              href="/roommates/requests"
              className="group relative rounded-3xl bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              {data.pendingRequests > 0 && (
                <span className="absolute right-5 top-5 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#fff1e7] px-2 text-xs font-bold text-[#d97832]">
                  {data.pendingRequests}
                </span>
              )}

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1e7] text-2xl transition group-hover:scale-105">
                📩
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#183b2c]">
                Requests
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#718078]">
                {data.pendingRequests > 0
                  ? `${data.pendingRequests} pending ${
                      data.pendingRequests === 1 ? "request" : "requests"
                    }.`
                  : "No pending roommate requests."}
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
                Connections
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#718078]">
                {data.connections > 0
                  ? `${data.connections} ${
                      data.connections === 1
                        ? "roommate connection"
                        : "roommate connections"
                    }.`
                  : "You have no connections yet."}
              </p>
            </Link>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-[#183b2c] p-7 text-white lg:col-span-2">
              <p className="text-sm font-medium text-[#f2b27b]">
                Your Baraka Nest
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Find your space. Find your people.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                {profile
                  ? "Your roommate profile is ready. Explore students, connect with people who match your vibe, or find your next home."
                  : "Create your roommate profile to start connecting with students who match your vibe."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/houses"
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#183b2c] transition hover:bg-[#f2f4ef]"
                >
                  Explore houses
                </Link>

                <Link
                  href={profile ? "/roommates" : "/roommates/create"}
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {profile
                    ? "Find roommates"
                    : "Create roommate profile"}
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#718078]">
                    Profile
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-[#183b2c]">
                    {profile
                      ? "Profile strength"
                      : "Create your profile"}
                  </h2>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf2ed] text-sm font-bold text-[#183b2c]">
                  {profileCompletion}%
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#edf0eb]">
                <div
                  className="h-full rounded-full bg-[#e58b45] transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-[#718078]">
                {profile
                  ? profileCompletion === 100
                    ? "Your profile is complete."
                    : `${profileCompletion}% complete. Add more details to improve your roommate matches.`
                  : "Create a roommate profile to start building your profile."}
              </p>

              <Link
                href="/roommates/create"
                className="mt-5 inline-block text-sm font-semibold text-[#183b2c] transition hover:text-[#e58b45]"
              >
                {profile ? "Update profile →" : "Create profile →"}
              </Link>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-7 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#718078]">
                    Your profile
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#183b2c]">
                    {profile ? profile.name : "No roommate profile yet"}
                  </h2>
                </div>

                {profile && (
                  <Link
                    href="/roommates/create"
                    className="text-sm font-semibold text-[#183b2c] transition hover:text-[#e58b45]"
                  >
                    Edit
                  </Link>
                )}
              </div>

              {profile ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#f7f8f4] p-4">
                    <p className="text-xs font-medium text-[#8a948d]">
                      School
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                      {profile.school}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f7f8f4] p-4">
                    <p className="text-xs font-medium text-[#8a948d]">
                      Location
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                      {profile.location}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f7f8f4] p-4">
                    <p className="text-xs font-medium text-[#8a948d]">
                      Monthly budget
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                      KSh {profile.budget.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f7f8f4] p-4">
                    <p className="text-xs font-medium text-[#8a948d]">
                      Move-in
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                      {profile.moveIn}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-[#dfe4dc] bg-[#fafbf9] p-6">
                  <p className="text-sm leading-6 text-[#718078]">
                    You haven&apos;t created a roommate profile yet. Add your
                    details so other students can discover you and find a
                    better match.
                  </p>

                  <Link
                    href="/roommates/create"
                    className="mt-5 inline-block rounded-full bg-[#183b2c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285640]"
                  >
                    Create roommate profile
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-sm">
              <p className="text-sm font-medium text-[#718078]">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#183b2c]">
                Your numbers
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-[#f7f8f4] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📩</span>
                    <span className="text-sm font-semibold text-[#183b2c]">
                      Pending requests
                    </span>
                  </div>

                  <span className="text-lg font-bold text-[#e58b45]">
                    {data.pendingRequests}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#f7f8f4] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔗</span>
                    <span className="text-sm font-semibold text-[#183b2c]">
                      Connections
                    </span>
                  </div>

                  <span className="text-lg font-bold text-[#183b2c]">
                    {data.connections}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#f7f8f4] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👤</span>
                    <span className="text-sm font-semibold text-[#183b2c]">
                      Profile
                    </span>
                  </div>

                  <span className="text-sm font-bold text-[#183b2c]">
                    {profile ? "Active" : "Not created"}
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