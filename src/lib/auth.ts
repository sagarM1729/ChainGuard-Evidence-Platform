// 🔐 NextAuth configuration placeholder
import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
	providers: [
		Credentials({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials) {
				if (!credentials?.email) return null
				// TODO: validate against database
				return { id: 'demo-user', email: credentials.email }
			}
		})
	],
	session: { strategy: 'jwt' }
}
