import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone включается только в Docker-сборке (BUILD_STANDALONE=1),
  // чтобы локальный `npm run build` на Windows не упирался в создание symlink'ов
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
};

export default nextConfig;
