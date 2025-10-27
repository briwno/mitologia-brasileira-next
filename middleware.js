// middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  const host = req.headers.get('host') || '';
  const url = req.nextUrl;

  if (host === 'promo.kaaguy.app') {
    if (url.pathname !== '/divulgar') {
      const rewriteUrl = new URL('/divulgar', url);
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|images|.*\\..*).*)',
  ],
};
