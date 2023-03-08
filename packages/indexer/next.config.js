/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ["page.tsx", "page.ts", "api.ts"],
  eslint: {
    // CI already handles this, so don't do it twice.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
