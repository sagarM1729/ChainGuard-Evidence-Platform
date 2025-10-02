"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-[#1f7a8c]/10 shadow-sm">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity duration-300 cursor-pointer">
						<div className="relative">
							<div className="absolute -inset-1 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-lg blur opacity-30"></div>
							<div className="relative bg-white p-1.5 sm:p-2 rounded-lg shadow-md border border-[#1f7a8c]/20">
								<Image 
									src="/blockchain.png" 
									alt="ChainGuard Logo" 
									width={20} 
									height={20}
									className="object-contain sm:w-6 sm:h-6"
								/>
							</div>
						</div>
						<div className="flex flex-col">
							<span className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] bg-clip-text text-transparent">ChainGuard</span>
							<span className="text-[10px] sm:text-xs text-[#022b3a]/70 font-medium tracking-wide">EVIDENCE PLATFORM</span>
						</div>
					</Link>

					{/* Desktop Menu */}
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

					{/* Mobile Menu Button */}
					<button 
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="md:hidden p-2 text-[#022b3a] hover:text-[#1f7a8c] transition-colors"
					>
						{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<div className="md:hidden py-4 border-t border-[#1f7a8c]/10 bg-white/95 backdrop-blur-lg">
						<div className="flex flex-col space-y-3">
							<Link href="/login" onClick={() => setMobileMenuOpen(false)}>
								<button className="w-full group relative px-5 py-3 text-[#1f7a8c] font-semibold rounded-lg border-2 border-[#1f7a8c] backdrop-blur-sm bg-white/80 shadow-lg active:scale-95 transition-all duration-300 overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] translate-y-full group-active:translate-y-0 transition-transform duration-300 ease-out"></div>
									<span className="relative z-10 transition-colors duration-300 group-active:text-white">Login</span>
								</button>
							</Link>
							<Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
								<button className="w-full group relative px-5 py-3 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white font-semibold rounded-lg shadow-lg active:scale-95 transition-all duration-300 overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] opacity-0 group-active:opacity-100 transition-opacity duration-300 ease-out"></div>
									<span className="relative z-10">Sign Up</span>
								</button>
							</Link>
						</div>
					</div>
				)}
			</div>
		</nav>
	)
}
