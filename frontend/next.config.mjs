const backendApiTarget =
  process.env.INTERNAL_API_URL ||
  process.env.BACKEND_INTERNAL_URL ||
  "http://127.0.0.1:5000/api";
const backendPublicTarget = backendApiTarget.replace(/\/api\/?$/, "");

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
  },
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendApiTarget.replace(/\/$/, "")}/:path*`
      },
      {
        source: "/uploads/:path*",
        destination: `${backendPublicTarget.replace(/\/$/, "")}/uploads/:path*`
      }
    ];
  }
};

export default nextConfig;
