/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "alxumjnogtweqedpmnxe.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://roadsidecoder.created.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
