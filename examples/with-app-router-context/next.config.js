/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['next-dynenv'],
        // This is optional incase you want to make some private env vars publicly
        // available.
        instrumentationHook: true,
    },
}

module.exports = nextConfig
