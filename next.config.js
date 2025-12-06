/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Disabled to support API routes
  images: { unoptimized: true },
  // No redirects needed; landing page is now main page
};

module.exports = nextConfig;
