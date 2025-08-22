// 🌐 Root layout component
import './globals.css'
import React from 'react'
import AuthProvider from '@/components/providers/AuthProvider'

export const metadata = {
	title: 'ChainGuard Evidence Platform',
	description: 'Secure evidence management with blockchain and AI'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="h-full bg-slate-900 text-slate-100">
			<body className="min-h-screen antialiased">
				<AuthProvider>
					{children}
				</AuthProvider>
			</body>
		</html>
	)
}
