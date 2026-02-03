import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
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

  // Ajouter des headers pour améliorer l'indexation des pages d'épisodes
  if (pathname.startsWith("/episodes/")) {
    const response = NextResponse.next();
    
    // Headers pour l'indexation
    response.headers.set("X-Robots-Tag", "index, follow");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "origin-when-cross-origin");
    
    // Headers pour le cache et les performances
    response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
    
    return response;
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