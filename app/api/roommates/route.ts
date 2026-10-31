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

export async function GET() {
  const profiles = getAllRoommateProfiles() as RoommateProfileRow[];

  const formattedProfiles = profiles.map((profile) => ({
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
    interests: JSON.parse(profile.interests) as string[],
    lifestyle: JSON.parse(profile.lifestyle) as string[],
  }));

  return Response.json({
    profiles: formattedProfiles,
  });
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

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const age = Number(body.age);
    const school = String(body.school ?? "").trim();
    const location = String(body.location ?? "").trim();
    const budget = Number(body.budget);
    const moveIn = String(body.moveIn ?? "").trim();
    const preference = String(body.preference ?? "").trim();
    const about = String(body.about ?? "").trim();

    const interests = Array.isArray(body.interests)
      ? body.interests.map((item: unknown) => String(item))
      : [];

    const lifestyle = Array.isArray(body.lifestyle)
      ? body.lifestyle.map((item: unknown) => String(item))
      : [];

    if (
      !name ||
      !age ||
      !school ||
      !location ||
      !budget ||
      !moveIn ||
      !preference ||
      !about
    ) {
      return Response.json(
        {
          error: "Please complete all required profile details.",
        },
        { status: 400 },
      );
    }

    if (age < 16 || age > 100) {
      return Response.json(
        {
          error: "Please enter a valid age.",
        },
        { status: 400 },
      );
    }

    if (budget < 500) {
      return Response.json(
        {
          error: "Please enter a valid monthly budget.",
        },
        { status: 400 },
      );
    }

    const id = createId();

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
        username:
          (session.user as typeof session.user & { username?: string })
            .username ??
          session.user.name ??
          "student",
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