/** @type {import('next').NextConfig} */
const isGithub = process.env.GITHUB_ACTIONS === "true";
const repo = "agent-fullstack-knowledge";
const basePath = isGithub ? `/${repo}` : "";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "export",
  images: { unoptimized: true },
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
