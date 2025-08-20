// 📄 Auth landing page (login/signup)
import React from 'react'

export default function AuthPage() {
	return (
		<main className="flex min-h-screen items-center justify-center p-6">
			<div className="w-full max-w-md space-y-6 rounded-lg bg-slate-800 p-8 shadow-xl">
				<h1 className="text-2xl font-semibold tracking-tight">Welcome to ChainGuard</h1>
				<p className="text-sm text-slate-300">Authenticate to access your dashboard.</p>
				{/* AuthForm component will replace this placeholder */}
				<div className="rounded border border-dashed border-slate-600 p-6 text-center text-slate-400">
					AuthForm placeholder
				</div>
			</div>
		</main>
	)
}
