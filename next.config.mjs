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
      // Serve /divulgar para QUALQUER rota quando o host for promo.kaaguy.app
      {
        source: '/:path*',
        has: [
          { type: 'header', key: 'host', value: '(^|\\.)promo\\.kaaguy\\.app$' }
        ],
        destination: '/divulgar',
      },
    ];
  },
};

export default nextConfig;
