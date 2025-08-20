// ⭐📲 Next.js configuration with PWA wrapper (placeholder)
import withPWA from 'next-pwa'

const pwa = withPWA({
	dest: 'public',
	disable: process.env.NODE_ENV === 'development'
})

const nextConfig = {
	reactStrictMode: true,
	experimental: {
		// Adjust serverActions to object shape (or remove if not needed)
		serverActions: {}
	}
}

export default pwa(nextConfig)
