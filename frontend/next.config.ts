import type { NextConfig } from "next";

// The browser only ever talks to this Next.js site (same origin).
// Next forwards every /api/* call to the Express backend, so the login cookie
// belongs to this site and no CORS setup is needed.
const backend = process.env.BACKEND_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default nextConfig;
