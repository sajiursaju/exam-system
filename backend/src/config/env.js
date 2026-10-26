// Reads .env once and exports clean settings. Stops the app early if something is missing.
require("dotenv").config();

const required = ["DATABASE_URL", "JWT_SECRET", "CLIENT_URL"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
}

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  clientUrl: process.env.CLIENT_URL,
  isProd: process.env.NODE_ENV === "production",
};
