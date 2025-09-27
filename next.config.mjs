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
	},
	webpack: (config) => {
		config.ignoreWarnings = [
			...(config.ignoreWarnings || []),
			/Critical dependency: require function is used in a way in which dependencies cannot be statically extracted.*yargs/i
		]
		return config
	}
}

export default pwa(nextConfig)
