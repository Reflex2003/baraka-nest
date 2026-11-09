import { auth } from "@/lib/better-auth";
import { query } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";

const termsVersion = "2026-11-09";
const privacyVersion = "2026-11-09";

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ success: false, message: "Request origin is not allowed." }, { status: 403 });
    if (Number(request.headers.get("content-length") ?? 0) > 3000) return Response.json({ success: false, message: "Registration request is too large." }, { status: 413 });
    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const username = String(body.username ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    if (body.acceptedPolicies !== true) {
      return Response.json(
        { success: false, message: "Accept the Terms of Service and acknowledge the Privacy Policy to create an account." },
        { status: 400 },
      );
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return Response.json(
        {
          success: false,
          message:
            "Username must be 3-20 characters and use only letters, numbers, or underscores.",
        },
        { status: 400 },
      );
    }

    if (password.length < 6 || password.length > 200) {
      return Response.json(
        {
          success: false,
          message:
            "Password must be between 6 and 200 characters.",
        },
        { status: 400 },
      );
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return Response.json(
        {
          success: false,
          message:
            "Password must contain at least one letter and one number.",
        },
        { status: 400 },
      );
    }

    const result = await auth.api.signUpEmail({
      body: {
        name: username,
        username,
        email: `${username}@baraka-nest.local`,
        password,
      },
      headers: request.headers,
    });

    try {
      await query(
        `CREATE TABLE IF NOT EXISTS legal_acceptance (
          user_id TEXT NOT NULL,
          terms_version TEXT NOT NULL,
          privacy_version TEXT NOT NULL,
          accepted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, terms_version, privacy_version)
        )`,
      );
      await query(
        `INSERT INTO legal_acceptance (user_id, terms_version, privacy_version)
         VALUES (?, ?, ?)`,
        [result.user.id, termsVersion, privacyVersion],
      );
    } catch (acceptanceError) {
      console.error("Legal acceptance record could not be saved:", acceptanceError);
    }

    return Response.json(
      {
        success: true,
        user: {
          id: result.user.id,
          username:
            (result.user as typeof result.user & {
              username?: string;
            }).username ?? username,
          name: result.user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    return Response.json(
      {
        success: false,
        message: "Username already exists or registration failed.",
      },
      { status: 400 },
    );
  }
}
