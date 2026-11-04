import Link from "next/link";
import Navbar from "../navbar";
import { requireSession } from "@/lib/auth-session";
import { getRoommateProfileByUserId } from "@/lib/roommate-db";

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

function calculateCompletion(profile: RoommateProfile | undefined) {
  if (!profile) {
    return 0;
  }

  const fields = [
    profile.name,
    profile.age,
    profile.school,
    profile.location,
    profile.budget,
    profile.move_in,
    profile.preference,
    profile.about,
  ];

  const completed = fields.filter(Boolean).length;

  return Math.round((completed / fields.length) * 100);
}

export default async function ProfilePage() {
  const session = await requireSession();

  const profile = getRoommateProfileByUserId(
    session.user.id,
  ) as RoommateProfile | undefined;

  const completion = calculateCompletion(profile);

  const displayName =
    profile?.name || session.user.name || "Student";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f8f4] px-5 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-semibold text-[#e58b45]">
              Baraka Nest
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#183b2c]">
              Your Profile
            </h1>

            <p className="mt-2 text-[#647067]">
              Manage your profile and improve your roommate matches.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
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
                  : "No roommate profile yet"}
              </p>

              {profile && (
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-[#f7f8f4] p-4">
                    <p className="text-xs text-[#8a948d]">School</p>
                    <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                      {profile.school}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f7f8f4] p-4">
                    <p className="text-xs text-[#8a948d]">Location</p>
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
                {profile ? "Edit profile" : "Create profile"}
              </Link>
            </section>

            <section className="rounded-3xl bg-white p-7 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#183b2c]">
                    Profile progress
                  </h2>

                  <p className="mt-1 text-sm text-[#718078]">
                    Complete your details to get better roommate matches.
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#edf2ed] text-sm font-bold text-[#183b2c]">
                  {completion}%
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#edf0eb]">
                <div
                  className="h-full rounded-full bg-[#e58b45] transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-[#718078]">
                {!profile
                  ? "Create your roommate profile to get started."
                  : completion === 100
                    ? "Your profile is complete."
                    : `${completion}% complete. Add more details to improve your matches.`}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "👤",
                    "Basic information",
                    profile?.name && profile?.age
                      ? "Complete"
                      : "Add details",
                  ],
                  [
                    "🎓",
                    "School details",
                    profile?.school ? "Complete" : "Add details",
                  ],
                  [
                    "📍",
                    "Location",
                    profile?.location ? "Complete" : "Add details",
                  ],
                  [
                    "🏠",
                    "Housing preferences",
                    profile?.budget &&
                    profile?.move_in &&
                    profile?.preference
                      ? "Complete"
                      : "Add details",
                  ],
                ].map(([icon, label, status]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[#edf0eb] p-4"
                  >
                    <span className="text-xl">{icon}</span>

                    <p className="mt-2 text-sm font-semibold text-[#183b2c]">
                      {label}
                    </p>

                    <p
                      className={`mt-1 text-xs font-medium ${
                        status === "Complete"
                          ? "text-[#4c7a5f]"
                          : "text-[#8a948d]"
                      }`}
                    >
                      {status}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {profile && (
            <section className="mt-6 rounded-3xl bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold text-[#183b2c]">
                About you
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#647067]">
                {profile.about}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#f7f8f4] p-4">
                  <p className="text-xs text-[#8a948d]">Age</p>
                  <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                    {profile.age}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f8f4] p-4">
                  <p className="text-xs text-[#8a948d]">
                    Monthly budget
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                    KSh {profile.budget.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f8f4] p-4">
                  <p className="text-xs text-[#8a948d]">Move-in</p>
                  <p className="mt-1 text-sm font-semibold text-[#183b2c]">
                    {profile.move_in}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}