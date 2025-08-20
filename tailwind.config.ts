/** 💅✨ Tailwind CSS configuration */
import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./src/app/**/*.{ts,tsx}',
		'./src/components/**/*.{ts,tsx}',
		'./src/(pages)/**/*.{ts,tsx}'
	],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: '#0f172a',
					light: '#1e293b'
				}
			}
		}
	},
	plugins: []
}

export default config
