import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import {
  getAllRoommateProfiles,
  getRoommateProfileByUserId,
  roommateDb,
} from "@/lib/roommate-db";

type RoommateProfileRow = {
  id: string;
  user_id: string;
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
  created_at: string;
  updated_at: string;
};

function createId() {
  return crypto.randomUUID();
}

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is string => typeof item === "string",
    );
  } catch {
    return [];
  }
}

function formatProfile(profile: RoommateProfileRow) {
  return {
    id: profile.id,
    username: profile.username,
    name: profile.name,
    age: profile.age,
    school: profile.school,
    location: profile.location,
    budget: profile.budget,
    moveIn: profile.move_in,
    preference: profile.preference,
    about: profile.about,
    interests: parseJsonArray(profile.interests),
    lifestyle: parseJsonArray(profile.lifestyle),
  };
}

function scoreMatch(
  mine: RoommateProfileRow,
  other: RoommateProfileRow,
) {
  const budgetDistance = Math.abs(mine.budget - other.budget) /
    Math.max(mine.budget, other.budget, 1);
  const budget = budgetDistance <= 0.15;
  const ownArea = mine.location.toLowerCase().split(",")[0].trim();
  const otherArea = other.location.toLowerCase().split(",")[0].trim();
  const location = ownArea === otherArea || mine.location.toLowerCase().includes(otherArea);
  const ownLifestyle = parseJsonArray(mine.lifestyle).map((item) => item.toLowerCase());
  const otherLifestyle = parseJsonArray(other.lifestyle).map((item) => item.toLowerCase());
  const ownInterests = parseJsonArray(mine.interests).map((item) => item.toLowerCase());
  const otherInterests = parseJsonArray(other.interests).map((item) => item.toLowerCase());
  const lifestyle = ownLifestyle.some((item) => otherLifestyle.includes(item));
  const interests = ownInterests.some((item) => otherInterests.includes(item));
  const score = (budget ? 35 : budgetDistance <= 0.3 ? 20 : 5) +
    (location ? 30 : 8) +
    (lifestyle ? 20 : 6) +
    (interests ? 15 : 5);

  return {
    matchScore: score,
    matchBreakdown: { budget, location, lifestyle, interests },
  };
}

function isValidText(value: string, maxLength: number) {
  return value.length > 0 && value.length <= maxLength;
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    await ensureFeatureTables();
    const profiles = (await getAllRoommateProfiles()) as unknown as RoommateProfileRow[];
    const currentProfile = session?.user
      ? await getRoommateProfileByUserId(session.user.id) as unknown as RoommateProfileRow | undefined
      : undefined;
    const blockedIds = session?.user
      ? await roommateDb.prepare(`
          SELECT blocked_user_id AS user_id FROM user_block WHERE blocker_user_id = ?
          UNION
          SELECT blocker_user_id AS user_id FROM user_block WHERE blocked_user_id = ?
        `).all(session.user.id, session.user.id) as { user_id: string }[]
      : [];
    const hiddenByBlocks = new Set(blockedIds.map((item) => item.user_id));
    const visibleProfiles = profiles.filter((profile) =>
      profile.user_id !== session?.user?.id && !hiddenByBlocks.has(profile.user_id),
    );

    return Response.json({
      profiles: visibleProfiles.map((profile) => ({
        ...formatProfile(profile),
        ...(currentProfile ? scoreMatch(currentProfile, profile) : {
          matchScore: null,
          matchBreakdown: null,
        }),
      })),
    });
  } catch (error) {
    console.error("Roommate profiles error:", error);

    return Response.json(
      {
        error: "Something went wrong while loading roommate profiles.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    if (Number(request.headers.get("content-length") ?? 0) > 12000) return Response.json({ error: "Profile data is too large." }, { status: 413 });
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json(
        {
          error: "You must be logged in to create a roommate profile.",
        },
        { status: 401 },
      );
    }

    const existingProfile = await getRoommateProfileByUserId(session.user.id);

    if (existingProfile) {
      return Response.json(
        {
          error: "You already have a roommate profile.",
        },
        { status: 409 },
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          error: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const name = String(body.name ?? "").trim();
    const age = Number(body.age);
    const school = String(body.school ?? "").trim();
    const location = String(body.location ?? "").trim();
    const budget = Number(body.budget);
    const moveIn = String(body.moveIn ?? "").trim();
    const preference = String(body.preference ?? "").trim();
    const about = String(body.about ?? "").trim();

    const interests = Array.isArray(body.interests)
      ? body.interests
          .slice(0, 20)
          .map((item: unknown) => String(item).trim())
          .filter(Boolean)
      : [];

    const lifestyle = Array.isArray(body.lifestyle)
      ? body.lifestyle
          .slice(0, 20)
          .map((item: unknown) => String(item).trim())
          .filter(Boolean)
      : [];

    if (
      !isValidText(name, 100) ||
      !isValidText(school, 150) ||
      !isValidText(location, 150) ||
      !isValidText(moveIn, 100) ||
      !isValidText(preference, 100) ||
      !isValidText(about, 2000)
    ) {
      return Response.json(
        {
          error: "Please complete all required profile details correctly.",
        },
        { status: 400 },
      );
    }

    if (!Number.isInteger(age) || age < 16 || age > 100) {
      return Response.json(
        {
          error: "Please enter a valid age.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(budget) ||
      budget < 500 ||
      budget > 1000000
    ) {
      return Response.json(
        {
          error: "Please enter a valid monthly budget.",
        },
        { status: 400 },
      );
    }

    if (
      interests.some((item) => item.length > 100) ||
      lifestyle.some((item) => item.length > 100)
    ) {
      return Response.json(
        {
          error: "Some interests or lifestyle entries are too long.",
        },
        { status: 400 },
      );
    }

    const id = createId();

    const username =
      (session.user as typeof session.user & {
        username?: string;
      }).username ??
      session.user.name ??
      "student";

    try {
      await roommateDb
        .prepare(
          `
            INSERT INTO roommate_profile (
              id,
              user_id,
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
            )
            VALUES (
              @id,
              @user_id,
              @username,
              @name,
              @age,
              @school,
              @location,
              @budget,
              @move_in,
              @preference,
              @about,
              @interests,
              @lifestyle
            )
          `,
        )
        .run({
          id,
          user_id: session.user.id,
          username,
          name,
          age,
          school,
          location,
          budget,
          move_in: moveIn,
          preference,
          about,
          interests: JSON.stringify(interests),
          lifestyle: JSON.stringify(lifestyle),
        });
    } catch (insertError) {
      const message =
        insertError instanceof Error
          ? insertError.message
          : "";

      if (
        message.includes("UNIQUE") ||
        message.includes("unique") ||
        message.includes("constraint")
      ) {
        return Response.json(
          {
            error: "You already have a roommate profile.",
          },
          { status: 409 },
        );
      }

      throw insertError;
    }

    return Response.json(
      {
        message: "Roommate profile created successfully.",
        id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Roommate profile error:", error);

    return Response.json(
      {
        error: "Something went wrong while creating your profile.",
      },
      { status: 500 },
    );
  }
}
