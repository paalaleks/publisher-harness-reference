import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  images: { unoptimized: true },
  generateBuildId: async () => "reference-site-before-remediation-v1",
};

export default config;
