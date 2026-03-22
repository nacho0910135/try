const nextConfig = {
  experimental: {
    webpackBuildWorker: false,
    workerThreads: true,
    cpus: 1,
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
    staticGenerationMinPagesPerWorker: 1000
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
