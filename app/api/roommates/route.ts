import { auth } from "@/auth";
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

function isValidText(value: string, maxLength: number) {
  return value.length > 0 && value.length <= maxLength;
}

export async function GET(request: Request) {
  try {
    await auth.api.getSession({
      headers: request.headers,
    });

    const profiles = getAllRoommateProfiles() as RoommateProfileRow[];

    return Response.json({
      profiles: profiles.map(formatProfile),
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

    const existingProfile = getRoommateProfileByUserId(session.user.id);

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
      roommateDb
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