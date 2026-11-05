import { auth } from "@/auth";
import { roommateDb } from "@/lib/roommate-db";
import { headers } from "next/headers";
import DashboardClient from "./dashboard-client";

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
    <DashboardClient
      profile={profile}
      pendingRequests={data.pendingRequests}
      connections={data.connections}
      displayName={displayName}
      profileCompletion={profileCompletion}
    />
  );
}