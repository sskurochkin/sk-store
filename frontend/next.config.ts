import type { NextConfig } from "next";

const nestOrigin =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001";

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  pathname: string;
};

function buildImageRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [
    {
      protocol: "https",
      hostname: "example.com",
      pathname: "/**",
    },
  ];

  const extra =
    process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS?.split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean) ?? [];

  const seen = new Set(patterns.map((p) => `${p.protocol}:${p.hostname}`));

  for (const hostname of extra) {
    // Hostname only — reject wildcards and paths.
    if (
      hostname.includes("*") ||
      hostname.includes("/") ||
      hostname.includes(":") ||
      hostname.includes(" ")
    ) {
      continue;
    }

    for (const protocol of ["https", "http"] as const) {
      const key = `${protocol}:${hostname}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      patterns.push({ protocol, hostname, pathname: "/**" });
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: buildImageRemotePatterns(),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${nestOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
