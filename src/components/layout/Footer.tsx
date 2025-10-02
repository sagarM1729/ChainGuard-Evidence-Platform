"use client"

import Link from "next/link"
import Image from "next/image"
import { Lock } from "lucide-react"

export default function Footer() {
	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId)
		if (element) {
			element.scrollIntoView({ 
				behavior: 'smooth',
				block: 'start'
			})
		}
	}

	return (
		<footer className="bg-gradient-to-br from-[#e1e5f2] via-white to-[#bfdbf7] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-[#1f7a8c]/10">
			<div className="mx-auto max-w-7xl">
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
					{/* Brand Section */}
					<div className="sm:col-span-2 lg:col-span-1">
						<Link href="/" className="inline-block">
							<div className="flex items-center space-x-3 mb-4 sm:mb-6 hover:opacity-80 transition-opacity duration-300 cursor-pointer">
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
									<span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] bg-clip-text text-transparent">ChainGuard</span>
									<span className="text-[10px] sm:text-xs text-[#022b3a] font-medium tracking-wide">EVIDENCE PLATFORM</span>
								</div>
							</div>
						</Link>
						<p className="text-sm sm:text-base text-[#022b3a] mb-4 sm:mb-6 max-w-md leading-relaxed font-medium">
							Securing justice with immutable evidence management. Built for law enforcement agencies who demand the highest standards of integrity and security.
						</p>
						<div className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 bg-green-50 rounded-xl border border-green-200 shadow-sm">
							<div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex-shrink-0">
								<Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
							</div>
							<span className="text-xs sm:text-sm font-semibold text-green-700">SOC 2 Type II Certified</span>
						</div>
					</div>
					
					{/* Quick Links */}
					<div>
						<h3 className="text-base sm:text-lg font-bold text-[#022b3a] mb-4 sm:mb-6">Platform</h3>
						<ul className="space-y-3 sm:space-y-4">
							<li>
								<button 
									onClick={() => scrollToSection('features')} 
									className="text-sm sm:text-base text-[#022b3a]/80 hover:text-[#1f7a8c] transition-colors font-medium hover:underline text-left"
								>
									Features
								</button>
							</li>
							<li>
								<button 
									onClick={() => scrollToSection('architecture')} 
									className="text-sm sm:text-base text-[#022b3a]/80 hover:text-[#1f7a8c] transition-colors font-medium hover:underline text-left"
								>
									Architecture
								</button>
							</li>
							<li>
								<button 
									onClick={() => scrollToSection('challenges')} 
									className="text-sm sm:text-base text-[#022b3a]/80 hover:text-[#1f7a8c] transition-colors font-medium hover:underline text-left"
								>
									Solutions
								</button>
							</li>
						</ul>
					</div>
					
					{/* Support */}
					<div>
						<h3 className="text-base sm:text-lg font-bold text-[#022b3a] mb-4 sm:mb-6">Support</h3>
						<ul className="space-y-3 sm:space-y-4">
							<li><span className="text-sm sm:text-base text-[#022b3a]/80 font-medium">Technical Support</span></li>
							<li><span className="text-sm sm:text-base text-[#022b3a]/80 font-medium">Documentation</span></li>
							<li><span className="text-sm sm:text-base text-[#022b3a]/80 font-medium">Training</span></li>
							<li><span className="text-sm sm:text-base text-[#022b3a]/80 font-medium">Security</span></li>
						</ul>
					</div>
				</div>
				
				<div className="border-t border-[#1f7a8c]/20 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-[#022b3a]/80 text-xs sm:text-sm font-medium text-center md:text-left">
						© 2025 ChainGuard Evidence Platform. All rights reserved.
					</p>
					<div className="flex flex-wrap justify-center gap-4 sm:gap-8">
						<span className="text-[#022b3a]/80 text-xs sm:text-sm hover:text-[#1f7a8c] transition-colors cursor-pointer font-medium hover:underline">Privacy Policy</span>
						<span className="text-[#022b3a]/80 text-xs sm:text-sm hover:text-[#1f7a8c] transition-colors cursor-pointer font-medium hover:underline">Terms of Service</span>
						<span className="text-[#022b3a]/80 text-xs sm:text-sm hover:text-[#1f7a8c] transition-colors cursor-pointer font-medium hover:underline">Security</span>
					</div>
				</div>
			</div>
		</footer>
	)
}
