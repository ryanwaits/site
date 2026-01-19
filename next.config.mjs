import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  pageExtensions: ["mdx", "ts", "tsx"],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
