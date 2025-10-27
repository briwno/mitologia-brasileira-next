import { NextResponse } from 'next/server';

export function middleware(req) {
  const host = (req.headers.get('host') || '').toLowerCase();
  const url = req.nextUrl;

  const isPromo =
    host === 'promo.kaaguy.app' || host === 'www.promo.kaaguy.app';

  if (!isPromo) return NextResponse.next();

  const accept = req.headers.get('accept') || '';
  const isHtml = accept.includes('text/html');

  if (!isHtml || url.pathname === '/divulgar') {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL('/divulgar', url));
}

export const config = { matcher: '/:path*' };
