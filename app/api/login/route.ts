import { auth } from "@/lib/better-auth";
import { isSameOriginMutation } from "@/lib/request-security";

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ success: false, message: "Request origin is not allowed." }, { status: 403 });
    if (Number(request.headers.get("content-length") ?? 0) > 3000) return Response.json({ success: false, message: "Login request is too large." }, { status: 413 });
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

    if (username.length > 20) {
      return Response.json(
        {
          success: false,
          message: "Invalid username or password.",
        },
        { status: 401 },
      );
    }

    if (password.length > 200) {
      return Response.json(
        {
          success: false,
          message: "Invalid username or password.",
        },
        { status: 401 },
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
