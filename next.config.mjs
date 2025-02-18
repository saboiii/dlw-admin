/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'img.clerk.com',
            port: '',
            pathname: '/',
            search: '',
          },
          {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
            port: '',
            search: '',
          },
        ],
      },
};

export default nextConfig;
