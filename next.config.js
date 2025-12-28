/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true',
  },
  // Enable static export for GitHub Pages
  ...(process.env.GITHUB_PAGES === 'true' && {
    output: 'export',
    trailingSlash: true,
  }),
}

module.exports = nextConfig




