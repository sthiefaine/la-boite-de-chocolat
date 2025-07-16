import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si l'utilisateur accède aux pages d'authentification sans callbackUrl
  // et qu'il vient d'une page autre que la page d'accueil, on ajoute la callbackUrl
  if ((pathname === "/signin" || pathname === "/signup") && !request.nextUrl.searchParams.has("callbackUrl")) {
    const referer = request.headers.get("referer");
    
    if (referer) {
      const refererUrl = new URL(referer);
      const refererPath = refererUrl.pathname;
      
      // Ne pas ajouter de callbackUrl si l'utilisateur vient de la page d'accueil
      // ou d'une page d'authentification
      if (refererPath !== "/" && 
          !refererPath.startsWith("/signin") && 
          !refererPath.startsWith("/signup") &&
          !refererPath.startsWith("/api/")) {
        
        const newUrl = request.nextUrl.clone();
        newUrl.searchParams.set("callbackUrl", refererPath);
        
        return NextResponse.redirect(newUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
}; 