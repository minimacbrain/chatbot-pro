import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Skip auth check if env vars not configured
  if (!url || !key) {
    return NextResponse.next();
  }
  
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Demo mode bypass
  const isDemo = request.cookies.get('demo_mode')?.value === 'true' || 
                 request.nextUrl.searchParams.get('demo') === 'true';
  
  // Set demo cookie if ?demo=true
  if (request.nextUrl.searchParams.get('demo') === 'true') {
    supabaseResponse.cookies.set('demo_mode', 'true', { maxAge: 60 * 60 * 24 }); // 24 hours
  }

  // Protected routes (skip if demo mode)
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user && !isDemo) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect logged in users away from auth pages
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
