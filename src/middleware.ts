// 🛡️ Middleware protecting /dashboard routes (placeholder logic)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
	if (req.nextUrl.pathname.startsWith('/dashboard')) {
		// TODO: validate session / JWT
		const authorized = true
		if (!authorized) {
			const url = req.nextUrl.clone()
			url.pathname = '/'
			return NextResponse.redirect(url)
		}
	}
	return NextResponse.next()
}

export const config = {
	matcher: ['/dashboard/:path*']
}
