import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import Database from "better-sqlite3";

const db = new Database("baraka-nest.db");

export const auth = betterAuth({
  database: db,

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 20,
      immutableUsername: true,
      displayUsername: false,
      usernameValidator: (username) => {
        return /^[a-zA-Z0-9_]+$/.test(username);
      },
    }),
  ],
});