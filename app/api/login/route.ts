import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!username || !password) {
      return Response.json(
        {
          success: false,
          message: "Username and password are required.",
        },
        { status: 400 },
      );
    }

    const result = await auth.api.signInUsername({
      body: {
        username,
        password,
      },
      headers: request.headers,
      asResponse: true,
    });

    return result;
  } catch (error) {
    console.error("Login error:", error);

    return Response.json(
      {
        success: false,
        message: "Invalid username or password.",
      },
      { status: 401 },
    );
  }
}