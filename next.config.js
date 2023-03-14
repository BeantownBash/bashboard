/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: false,
    },
    images: {
        remotePatterns: [
            {
                protocol: process.env.IMG_PROTOCOL,
                hostname: process.env.IMG_HOSTNAME,
                port: process.env.IMG_PORT,
                pathname: '/api/res/images/**',
            },
        ],
    },
};

module.exports = nextConfig;
