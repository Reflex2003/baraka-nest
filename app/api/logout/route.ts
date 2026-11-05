import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const result = await auth.api.signOut({
      headers: request.headers,
      asResponse: true,
    });

    return result;
  } catch (error) {
    console.error("Logout error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to log out.",
      },
      { status: 500 },
    );
  }
}