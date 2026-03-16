import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { searchParams, pathname } = request.nextUrl;
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");

    // Redirect Firebase auth action links to the auth action handler
    if (pathname === "/" && mode && oobCode) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/action";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/"],
};
