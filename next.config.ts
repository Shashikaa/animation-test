import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed blanket Cache-Control: no-store.
  // That header was forcing every font, video, image and JS chunk
  // to re-download on each scroll interaction → network stalls → jank.
  // Next.js sets correct cache headers per asset type by default.
};

export default nextConfig;