import Navbar from "../navbar";
import { requireSession } from "@/lib/auth-session";
import { getRoommateProfileByUserId } from "@/lib/roommate-db";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

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

function calculateCompletion(
  profile: RoommateProfile | undefined,
) {
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

  return Math.round(
    (completed / fields.length) * 100,
  );
}

export default async function ProfilePage() {
  const session = await requireSession();

  const profileRow = await getRoommateProfileByUserId(
    session.user.id,
  ) as RoommateProfile | undefined;
  const profile: RoommateProfile | undefined = profileRow
    ? {
        id: String(profileRow.id),
        username: String(profileRow.username),
        name: String(profileRow.name),
        age: Number(profileRow.age),
        school: String(profileRow.school),
        location: String(profileRow.location),
        budget: Number(profileRow.budget),
        move_in: String(profileRow.move_in),
        preference: String(profileRow.preference),
        about: String(profileRow.about),
        interests: String(profileRow.interests),
        lifestyle: String(profileRow.lifestyle),
      }
    : undefined;

  const completion = calculateCompletion(profile);

  const displayName =
    profile?.name ||
    session.user.name ||
    "Student";

  return (
    <>
      <Navbar />

      <ProfileClient
        profile={profile}
        completion={completion}
        displayName={displayName}
      />
    </>
  );
}
