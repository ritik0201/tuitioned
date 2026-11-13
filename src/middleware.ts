import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // Allow unauthenticated access to the admin login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin/dashboard')) {
    if (!token || token.role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/unauthorized'; // Or your login page
      return NextResponse.redirect(url);
    }
  }

  // Protect /student routes
  if (pathname.startsWith('/student')) {
    // Allow 'student', 'teacher', and 'admin' roles for games and test
    const isSharedFeature = pathname.startsWith('/student/games') || pathname.startsWith('/student/test');
    const allowedRoles = isSharedFeature ? ['student', 'teacher', 'admin'] : ['student', 'admin'];
    if (!token || !allowedRoles.includes(token.role as string)) {
      const url = req.nextUrl.clone();
      url.pathname = '/unauthorized'; // Redirect to unauthorized or login
      return NextResponse.redirect(url);
    }
  }

  // Protect /teacher routes
  if (pathname.startsWith('/teacher')) {
    // Only allow 'teacher' and 'admin' roles
    if (!token || (token.role !== 'teacher' && token.role !== 'admin')) {
      const url = req.nextUrl.clone();
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/teacher/:path*'],
};