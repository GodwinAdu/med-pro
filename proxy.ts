
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'


interface JWTPayload {
    exp: number
    user?: {
        roles: string[]
    }
}

const authConfig = {
    publicRoutes: [
        "/",
        "/login",   
        "/signup",
        "/api/*",
        "/payment/mobile-money/callback",
        "/subscription/callback",
        "/coins"
    ],
    protectedRoutes: [] as string[],
    loginUrl: "/login",
    afterAuthUrl: "/",
    cookieName: "token",
    requireRoles: [] as string[],
}
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get(authConfig.cookieName)?.value

    // ✅ Make all API routes public (no auth check)
    if (pathname.startsWith("/api")) {
        return NextResponse.next()
    }

    // ✅ Allow chat route prefix
    if (pathname.startsWith("/chat")) {
        return NextResponse.next();
    }

    // Check if route is public
    const isPublicRoute = authConfig.publicRoutes.some((route: string) => {
        if (route.endsWith("*")) {
            return pathname.startsWith(route.slice(0, -1))
        }
        return pathname === route || pathname.startsWith(route + "/")
    })

    // Check if route is protected
    const isProtectedRoute =
        authConfig.protectedRoutes.length > 0
            ? authConfig.protectedRoutes.some((route: string) => {
                if (route.endsWith("*")) {
                    return pathname.startsWith(route.slice(0, -1))
                }
                return pathname === route || pathname.startsWith(route + "/")
            })
            : !isPublicRoute



    // If accessing public route and authenticated, redirect to after auth URL
    if (isPublicRoute && token && (pathname === authConfig.loginUrl || pathname === "/signup")) {
        try {
            const decoded = jwtDecode<JWTPayload>(token)
            if (decoded.exp * 1000 > Date.now()) {
                return NextResponse.redirect(new URL(authConfig.afterAuthUrl, request.url))
            }
        } catch (error) {
            // Invalid token, continue to public route
        }
    }

    // If accessing protected route without token, redirect to login
    if (isProtectedRoute && !token) {
        const loginUrlWithRedirect = new URL(authConfig.loginUrl, request.url)
        loginUrlWithRedirect.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrlWithRedirect)
    }

    // If token exists, verify it
    if (token && isProtectedRoute) {
        try {
            const decoded = jwtDecode<JWTPayload>(token)

            // Check if token is expired
            if (decoded.exp * 1000 <= Date.now()) {
                const loginUrlWithRedirect = new URL(authConfig.loginUrl, request.url)
                loginUrlWithRedirect.searchParams.set("redirect", pathname)
                const response = NextResponse.redirect(loginUrlWithRedirect)
                response.cookies.delete(authConfig.cookieName)
                return response
            }

            // Check roles if required
            if (authConfig.requireRoles.length > 0) {
                const userRoles = decoded.user?.roles || []
                const hasRequiredRole = authConfig.requireRoles.some((role) => userRoles.includes(role))

                if (!hasRequiredRole) {
                    return NextResponse.redirect(new URL("/unauthorized", request.url))
                }
            }
        } catch (error) {
            // Invalid token, redirect to login
            const loginUrlWithRedirect = new URL(authConfig.loginUrl, request.url)
            loginUrlWithRedirect.searchParams.set("redirect", pathname)
            const response = NextResponse.redirect(loginUrlWithRedirect)
            response.cookies.delete(authConfig.cookieName)
            return response
        }
    }

    return NextResponse.next()
}




export const config = {
    matcher: [
       // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}