import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { getRoommateProfileById, getRoommateProfileByUserId } from "@/lib/roommate-db";
import { roommateDb } from "@/lib/roommate-db";
import { isSameOriginMutation } from "@/lib/request-security";

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
  gender: string;
  profile_image: string | null;
  is_hidden: number;
};

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    await ensureFeatureTables();

    // Only registered Roommate Finders may view individual profiles. Direct
    // URL access from users without a roommate profile is denied entirely.
    const currentProfile = session?.user
      ? await getRoommateProfileByUserId(session.user.id)
      : undefined;
    if (!currentProfile) {
      return Response.json(
        {
          error: "Create a roommate profile to view available profiles.",
          code: "roommate_profile_required",
        },
        { status: 403 },
      );
    }

    const { id } = await params;
    const profileId = String(id ?? "").trim();

    if (!profileId || profileId.length > 100) {
      return Response.json(
        {
          error: "Invalid roommate profile.",
        },
        { status: 400 },
      );
    }

    const profile = (await getRoommateProfileById(profileId)) as
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

    if (Number(profile.is_hidden ?? 0) === 1 && profile.user_id !== session?.user?.id) {
      return Response.json({ error: "Roommate profile not found." }, { status: 404 });
    }

    if (session?.user) {
      const block = await roommateDb.prepare(`
        SELECT 1 FROM user_block
        WHERE (blocker_user_id = ? AND blocked_user_id = ?)
           OR (blocker_user_id = ? AND blocked_user_id = ?)
        LIMIT 1
      `).get(session.user.id, profile.user_id, profile.user_id, session.user.id);
      if (block) return Response.json({ error: "Roommate profile not found." }, { status: 404 });
    }

    return Response.json({
      profile: {
        id: profile.id,
        username: profile.username,
        image: profile.profile_image,
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
        gender: profile.gender ?? "",
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    if (Number(request.headers.get("content-length") ?? 0) > 12000) return Response.json({ error: "Profile data is too large." }, { status: 413 });
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return Response.json({ error: "Sign in to edit your roommate profile." }, { status: 401 });
    await ensureFeatureTables();

    const { id } = await params;
    const profileId = String(id ?? "").trim();
    if (!profileId || profileId.length > 100) return Response.json({ error: "Invalid roommate profile." }, { status: 400 });
    const existing = await getRoommateProfileById(profileId) as (RoommateProfileRow & { gender?: string }) | undefined;
    if (!existing || existing.user_id !== session.user.id) return Response.json({ error: "Roommate profile not found." }, { status: 404 });

    let body: Record<string, unknown>;
    try { body = await request.json(); } catch { return Response.json({ error: "Invalid request body." }, { status: 400 }); }
    const name = String(body.name ?? "").trim();
    const age = Number(body.age);
    const school = String(body.school ?? "").trim();
    const location = String(body.location ?? "").trim();
    const budget = Number(body.budget);
    const moveIn = String(body.moveIn ?? "").trim();
    const preference = String(body.preference ?? "").trim();
    const about = String(body.about ?? "").trim();
    const gender = String(body.gender ?? "").trim().slice(0, 60);
    const interests = Array.isArray(body.interests) ? body.interests.slice(0, 20).map((item: unknown) => String(item).trim()).filter(Boolean) : [];
    const lifestyle = Array.isArray(body.lifestyle) ? body.lifestyle.slice(0, 20).map((item: unknown) => String(item).trim()).filter(Boolean) : [];

    if (!name || name.length > 100 || !school || school.length > 150 || !location || location.length > 150 || !moveIn || moveIn.length > 100 || !preference || preference.length > 100 || !about || about.length > 2000) {
      return Response.json({ error: "Please complete all required profile details correctly." }, { status: 400 });
    }
    if (!Number.isInteger(age) || age < 16 || age > 100) return Response.json({ error: "Please enter a valid age." }, { status: 400 });
    if (!Number.isInteger(budget) || budget < 500 || budget > 1000000) return Response.json({ error: "Please enter a valid monthly budget." }, { status: 400 });
    if (interests.some((item) => item.length > 100) || lifestyle.some((item) => item.length > 100)) return Response.json({ error: "Some interests or lifestyle entries are too long." }, { status: 400 });

    await roommateDb.prepare(`
      UPDATE roommate_profile SET
        name = ?, age = ?, school = ?, location = ?, budget = ?, move_in = ?,
        preference = ?, about = ?, interests = ?, lifestyle = ?, gender = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(name, age, school, location, budget, moveIn, preference, about, JSON.stringify(interests), JSON.stringify(lifestyle), gender, profileId, session.user.id);

    return Response.json({ success: true, id: profileId });
  } catch (error) {
    console.error("Roommate profile update error:", error);
    return Response.json({ error: "Something went wrong while saving your profile." }, { status: 500 });
  }
}
