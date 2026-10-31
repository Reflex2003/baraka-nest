import { getRoommateProfileById } from "@/lib/roommate-db";

type RoommateProfileRow = {
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const profile = getRoommateProfileById(id) as
      | RoommateProfileRow
      | undefined;

    if (!profile) {
      return Response.json(
        {
          error: "Roommate profile not found.",
        },
        { status: 404 },
      );
    }

    return Response.json({
      profile: {
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
      },
    });
  } catch (error) {
    console.error("Roommate profile error:", error);

    return Response.json(
      {
        error: "Something went wrong while loading the roommate profile.",
      },
      { status: 500 },
    );
  }
}