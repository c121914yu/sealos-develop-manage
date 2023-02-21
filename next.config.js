/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  sassOptions: {
    additionalData: `
      @import "@/styles/variables.scss";
    `,
  }
}

module.exports = nextConfig
