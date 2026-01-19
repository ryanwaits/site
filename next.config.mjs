import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  pageExtensions: ["mdx", "ts", "tsx"],
};

const withMDX = createMDX();

export default withMDX(nextConfig);
