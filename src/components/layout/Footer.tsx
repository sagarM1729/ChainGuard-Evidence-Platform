"use client"

import Image from "next/image"
import { Lock } from "lucide-react"

export default function Footer() {
	return (
		<footer className="bg-gradient-to-br from-[#e1e5f2] via-white to-[#bfdbf7] py-16 px-4 sm:px-6 lg:px-8 border-t border-[#1f7a8c]/10">
			<div className="mx-auto max-w-7xl">
				<div className="grid lg:grid-cols-3 gap-12">
					{/* Brand Section */}
					<div>
						<div className="flex items-center space-x-3 mb-6">
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
								<span className="text-xl font-bold bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] bg-clip-text text-transparent">ChainGuard</span>
								<span className="text-xs text-[#022b3a] font-medium tracking-wide">EVIDENCE PLATFORM</span>
							</div>
						</div>
						<p className="text-[#022b3a] mb-6 max-w-md leading-relaxed font-medium">
							Securing justice with immutable evidence management. Built for law enforcement agencies who demand the highest standards of integrity and security.
						</p>
						<div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200 shadow-sm">
							<div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
								<Lock className="h-4 w-4 text-green-600" />
							</div>
							<span className="text-sm font-semibold text-green-700">SOC 2 Type II Certified</span>
						</div>
					</div>
					
					{/* Quick Links */}
					<div>
						<h3 className="text-lg font-bold text-[#022b3a] mb-6">Platform</h3>
						<ul className="space-y-4">
							<li><a href="#features" className="text-[#022b3a]/80 hover:text-[#1f7a8c] transition-colors font-medium hover:underline">Features</a></li>
							<li><a href="#architecture" className="text-[#022b3a]/80 hover:text-[#1f7a8c] transition-colors font-medium hover:underline">Architecture</a></li>
							<li><a href="#challenges" className="text-[#022b3a]/80 hover:text-[#1f7a8c] transition-colors font-medium hover:underline">Solutions</a></li>
							<li><a href="#contact" className="text-[#022b3a]/80 hover:text-[#1f7a8c] transition-colors font-medium hover:underline">Demo</a></li>
						</ul>
					</div>
					
					{/* Support */}
					<div>
						<h3 className="text-lg font-bold text-[#022b3a] mb-6">Support</h3>
						<ul className="space-y-4">
							<li><span className="text-[#022b3a]/80 font-medium">Technical Support</span></li>
							<li><span className="text-[#022b3a]/80 font-medium">Documentation</span></li>
							<li><span className="text-[#022b3a]/80 font-medium">Training</span></li>
							<li><span className="text-[#022b3a]/80 font-medium">Security</span></li>
						</ul>
					</div>
				</div>
				
				<div className="border-t border-[#1f7a8c]/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
					<p className="text-[#022b3a]/80 text-sm font-medium">
						© 2025 ChainGuard Evidence Platform. All rights reserved.
					</p>
					<div className="flex space-x-8 mt-4 md:mt-0">
						<span className="text-[#022b3a]/80 text-sm hover:text-[#1f7a8c] transition-colors cursor-pointer font-medium hover:underline">Privacy Policy</span>
						<span className="text-[#022b3a]/80 text-sm hover:text-[#1f7a8c] transition-colors cursor-pointer font-medium hover:underline">Terms of Service</span>
						<span className="text-[#022b3a]/80 text-sm hover:text-[#1f7a8c] transition-colors cursor-pointer font-medium hover:underline">Security</span>
					</div>
				</div>
			</div>
		</footer>
	)
}
