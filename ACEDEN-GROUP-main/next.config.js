/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Marketing site only. No proxying/rewrites to the product app —
  // all app links use NEXT_PUBLIC_APP_URL at render time (see src/lib/env.ts).
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
