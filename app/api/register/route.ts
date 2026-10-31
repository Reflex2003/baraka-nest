import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return Response.json(
        {
          success: false,
          message:
            "Username must be 3-20 characters and use only letters, numbers, or underscores.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        {
          success: false,
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return Response.json(
        {
          success: false,
          message: "Password must contain at least one letter and one number.",
        },
        { status: 400 }
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

    return Response.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return Response.json(
      {
        success: false,
        message: "Username already exists or registration failed.",
      },
      { status: 400 }
    );
  }
}