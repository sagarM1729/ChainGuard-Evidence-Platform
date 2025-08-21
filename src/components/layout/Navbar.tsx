"use client"

import Link from "next/link"
import Image from "next/image"

export default function Navbar() {
	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-[#1f7a8c]/10 shadow-sm">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="relative">
							<div className="absolute -inset-1 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-lg blur opacity-30"></div>
							<div className="relative bg-white p-2 rounded-lg shadow-md border border-[#1f7a8c]/20">
								<Image 
									src="/blockchain.png" 
									alt="ChainGuard Logo" 
									width={24} 
									height={24}
									className="object-contain"
								/>
							</div>
						</div>
						<div className="flex flex-col">
							<span className="text-lg font-bold bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] bg-clip-text text-transparent">ChainGuard</span>
							<span className="text-xs text-[#022b3a]/70 font-medium tracking-wide">EVIDENCE PLATFORM</span>
						</div>
					</div>
					<div className="hidden md:flex items-center space-x-3">
						<Link href="/login">
							<button className="group relative px-5 py-2 text-[#1f7a8c] font-semibold rounded-lg border-2 border-[#1f7a8c] backdrop-blur-sm bg-white/80 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
								<div className="absolute inset-0 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
								<span className="relative z-10 transition-colors duration-300 group-hover:text-white">Login</span>
							</button>
						</Link>
						<Link href="/signup">
							<button className="group relative px-5 py-2 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
								<div className="absolute inset-0 bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
								<span className="relative z-10">Sign Up</span>
							</button>
						</Link>
					</div>
				</div>
			</div>
		</nav>
	)
}
