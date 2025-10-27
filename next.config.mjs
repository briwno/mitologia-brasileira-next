/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'img.icons8.com',
      'icons8.com',
      'ebsjwcxutgubeligobai.supabase.co'
    ],
    formats: ['image/webp'],
  },

 async rewrites() {
  return [
    {
      source: '/',
      has: [
        {
          type: 'host',
          value: 'promo.kaaguy.app',
        },
      ],
      destination: '/divulgar',
    },
  ];
},
};

export default nextConfig;
