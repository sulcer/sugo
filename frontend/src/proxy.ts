import { NextResponse, type NextRequest } from 'next/server';
import { decideProxy } from '@/i18n/proxy-decision';

export function proxy(request: NextRequest) {
  const decision = decideProxy(request.nextUrl.pathname);
  if (decision.action === 'next') return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = decision.pathname;
  return decision.action === 'redirect' ? NextResponse.redirect(url, 308) : NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
