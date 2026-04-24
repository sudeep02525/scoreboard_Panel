import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // Allow landing page without auth
  if (pathname === '/') {
    // If admin logged in, redirect to admin panel
    if (token && role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Allow admin login page always
  if (pathname === '/admin/login') {
    if (token && role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Admin routes — only admin can access
  if (pathname.startsWith('/admin')) {
    if (!token || role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Dashboard and matches are now public - no authentication required
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/matches') || pathname.startsWith('/standings')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/dashboard/:path*', '/matches/:path*', '/standings/:path*'],
};
