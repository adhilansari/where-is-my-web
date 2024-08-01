import { authMiddleware, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isDashboardRoute = createRouteMatcher(['/(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const PUBLIC_ROUTES = ['/site', '/api/uploadthing'];
const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES)

const publicRoutes = createRouteMatcher([
  "/agency/sign-in(.*)",
  "/agency/sign-up(.*)",
  "/site",
  "/api/uploadthing",
]);

export default clerkMiddleware((auth, req) => {
  if (publicRoutes(req)) {
    return NextResponse.next();
  }

  const url = req.nextUrl;
  const searchParams = url.searchParams.toString();
  let hostname = req.headers;

  const pathWithSearchParams = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  const customSubdomain = hostname
    .get("host")
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0];

  if (
    url.pathname === "/" ||
    (url.pathname === "/site" && url.host === process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    return NextResponse.rewrite(new URL("/site", req.url));
  }

  if (
    url.pathname.startsWith("/agency") ||
    url.pathname.startsWith("/subaccount")
  ) {
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
  }

  if (customSubdomain) {
    return NextResponse.rewrite(
      new URL(`/${customSubdomain}${pathWithSearchParams}`, req.url)
    );
  }

  auth().protect();

  if (
    url.pathname === "/agency/sign-in" ||
    url.pathname === "/agency/sign-up"
  ) {
    return NextResponse.redirect(new URL(`/agency/sign-in`, req.url));
  }
});

// const publicRoutes = createRouteMatcher([
//   "/agency/sign-in(.*)",
//   "/agency/sign-up(.*)",
//   "/site",
//   "/api/uploadthing",
// ]);

// export default clerkMiddleware((auth, req) => {
//   if (publicRoutes(req)) {
//     return NextResponse.next();
//   }

//   const url = req.nextUrl;
//   const searchParams = url.searchParams.toString();
//   let hostname = req.headers;

//   const pathWithSearchParams = `${url.pathname}${
//     searchParams.length > 0 ? `?${searchParams}` : ""
//   }`;

//   const customSubdomain = hostname
//     .get("host")
//     ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
//     .filter(Boolean)[0];

//   if (
//     url.pathname === "/" ||
//     (url.pathname === "/site" && url.host === process.env.NEXT_PUBLIC_DOMAIN)
//   ) {
//     return NextResponse.rewrite(new URL("/site", req.url));
//   }

//   if (
//     url.pathname.startsWith("/agency") ||
//     url.pathname.startsWith("/subaccount")
//   ) {
//     return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
//   }

//   if (customSubdomain) {
//     return NextResponse.rewrite(
//       new URL(`/${customSubdomain}${pathWithSearchParams}`, req.url)
//     );
//   }

//   auth().protect();

//   if (
//     url.pathname === "/agency/sign-in" ||
//     url.pathname === "/agency/sign-up"
//   ) {
//     return NextResponse.redirect(new URL(`/agency/sign-in`, req.url));
//   }
// });


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};


