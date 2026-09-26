import { NextResponse, type NextRequest } from 'next/server';
import { decideProxy } from '@/i18n/proxy-decision';

export function proxy(request: NextRequest) {
  const decision = decideProxy(request.nextUrl.pathname);
  if (decision.action === 'next') return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = decision.pathname;
  if (decision.action === 'redirect') return NextResponse.redirect(url, 308);
  return NextResponse.rewrite(url, decision.status ? { status: decision.status } : undefined);
}

export const config = {
  matcher: ['/((?!_next/|.*\\..*).*)'],
};
