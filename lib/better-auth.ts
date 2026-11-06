import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { dialect } from "@/lib/db";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret || secret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.");
}
const baseURL = process.env.BETTER_AUTH_URL;
if (process.env.NODE_ENV === "production") {
  if (!baseURL) throw new Error("BETTER_AUTH_URL must be configured in production.");
  try {
    const authUrl = new URL(baseURL);
    const localBuild = process.env.NEXT_PHASE === "phase-production-build" &&
      ["localhost", "127.0.0.1", "::1"].includes(authUrl.hostname);
    if (authUrl.protocol !== "https:" && !localBuild) {
      throw new Error("BETTER_AUTH_URL must use HTTPS in production.");
    }
  } catch {
    throw new Error("BETTER_AUTH_URL must be a valid HTTPS URL in production.");
  }
}

export const auth = betterAuth({
  database: {
    dialect,
    type: "sqlite",
  },
  secret,
  baseURL,
  trustedOrigins: baseURL
    ? [baseURL]
    : [],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-up/email": { window: 60, max: 5 },
      "/sign-in/email": { window: 60, max: 10 },
    },
  },
  advanced: {
    database: {
      validateSchema: false,
    },
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 20,
      immutableUsername: true,
      displayUsername: false,
      usernameValidator: (value) => /^[a-zA-Z0-9_]+$/.test(value),
    }),
  ],
});
