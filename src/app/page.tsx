// 🏠 Main landing page
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Shield, Database, FileCheck, Lock, AlertTriangle, Users, HardDrive, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Home - Secure Evidence Management for Law Enforcement',
	description: 'ChainGuard Evidence Platform provides unbreachable, transparent, and intelligent evidence management using blockchain, AI, and IPFS. Trusted by law enforcement agencies worldwide.',
	keywords: [
		'evidence management platform',
		'blockchain evidence tracking',
		'law enforcement software',
		'digital evidence storage',
		'chain of custody protection',
		'IPFS evidence vault',
		'AI evidence analysis',
		'secure police evidence system'
	],
	openGraph: {
		title: 'ChainGuard - Secure Evidence Management for Law Enforcement',
		description: 'Unbreachable, transparent, and intelligent evidence management using blockchain, AI, and IPFS.',
		type: 'website',
		url: 'https://chainguard-evidence.com',
	},
}

export default function HomePage() {
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'ChainGuard Evidence Platform',
		description: 'Advanced evidence management platform for law enforcement using blockchain, AI, and IPFS technology',
		url: 'https://chainguard-evidence.com',
		applicationCategory: 'SecurityApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			priceCurrency: 'USD',
			category: 'Enterprise Software'
		},
		author: {
			'@type': 'Organization',
			name: 'ChainGuard',
		},
		provider: {
			'@type': 'Organization',
			name: 'ChainGuard Evidence Platform',
			url: 'https://chainguard-evidence.com'
		},
		featureList: [
			'Blockchain-based evidence tracking',
			'AI-powered pattern recognition',
			'IPFS distributed storage',
			'Chain of custody protection',
			'Real-time security monitoring'
		]
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className="min-h-screen bg-gradient-to-br from-[#e1e5f2] via-[#bfdbf7] to-[#e1e5f2]" style={{ scrollBehavior: 'smooth' }}>
				{/* Navigation Bar */}
				<Navbar />

				<main className="relative">
					{/* Hero Section */}
					<section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
						{/* Background Elements */}
						<div className="absolute inset-0 bg-gradient-to-br from-[#1f7a8c]/10 via-transparent to-[#022b3a]/10"></div>
						<div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#1f7a8c]/20 to-[#bfdbf7]/15 rounded-full blur-3xl"></div>
						<div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#bfdbf7]/20 to-[#e1e5f2]/15 rounded-full blur-3xl"></div>
						
						<div className="relative mx-auto max-w-7xl">
							<div className="text-center">
								<div className="flex justify-center mb-8">
									<div className="relative group">
										<div className="absolute -inset-3 bg-gradient-to-r from-[#1f7a8c] via-[#bfdbf7] to-[#022b3a] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
										<div className="relative bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#1f7a8c]/20">
											<Image 
												src="/blockchain.png" 
												alt="ChainGuard Logo" 
												width={80} 
												height={80}
												className="object-contain transform group-hover:scale-110 transition-transform duration-500"
											/>
										</div>
									</div>
								</div>
								<div className="max-w-5xl mx-auto">
									<h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
										<span className="bg-gradient-to-r from-[#022b3a] via-[#1f7a8c] to-[#022b3a] bg-clip-text text-transparent">ChainGuard:</span>
										<br />
										<span className="text-[#022b3a]">Securing Justice</span>
										<br />
										<span className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] bg-clip-text text-transparent">with Immutable Evidence</span>
									</h1>
									<p className="text-lg md:text-xl text-[#022b3a] mb-10 leading-relaxed font-medium max-w-4xl mx-auto">
										An unbreachable, transparent, and intelligent system for the complete lifecycle management of legal evidence.
									</p>
									<div className="flex flex-col sm:flex-row gap-4 justify-center">
										<Link href="/signup">
											<button className="group relative px-8 py-3 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
												<div className="absolute inset-0 bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
												<span className="relative z-10">Get Started</span>
											</button>
										</Link>
										<button className="group relative px-8 py-3 text-[#1f7a8c] font-bold text-lg rounded-xl border-2 border-[#1f7a8c] backdrop-blur-sm bg-white/80 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
											<div className="absolute inset-0 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
											<span className="relative z-10 transition-colors duration-300 group-hover:text-white">Learn More</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Core Challenges Section */}
					<section id="challenges" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
						<div className="absolute inset-0 bg-gradient-to-b from-white/90 to-[#e1e5f2]/40 backdrop-blur-sm"></div>
						<div className="relative mx-auto max-w-7xl w-full">
							<div className="text-center mb-16">
								<div className="inline-flex items-center px-6 py-3 bg-[#1f7a8c]/10 rounded-full mb-6 border border-[#1f7a8c]/20">
									<span className="text-sm font-bold text-[#1f7a8c] tracking-wide">CRITICAL CHALLENGES</span>
								</div>
								<h2 className="text-3xl md:text-4xl font-black text-[#022b3a] mb-6">
									Solving Critical Evidence<br />
									<span className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] bg-clip-text text-transparent">Management Challenges</span>
								</h2>
								<p className="text-lg text-[#022b3a] max-w-3xl mx-auto font-medium">
									Traditional evidence management systems face critical vulnerabilities. ChainGuard provides uncompromising solutions.
								</p>
							</div>
							
							<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
								<div className="group relative">
									<div className="absolute -inset-1 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
									<div className="relative text-center p-8 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#1f7a8c]/20 shadow-xl group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
										<div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🚫</div>
										<h3 className="text-xl font-bold text-[#022b3a] mb-4">Evidence Tampering</h3>
										<p className="text-[#022b3a]/80 leading-relaxed">Immutable blockchain records prevent unauthorized modifications to evidence data.</p>
									</div>
								</div>
								
								<div className="group relative">
									<div className="absolute -inset-1 bg-gradient-to-r from-[#022b3a] to-[#bfdbf7] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
									<div className="relative text-center p-8 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#1f7a8c]/20 shadow-xl group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
										<div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">⛓️</div>
										<h3 className="text-xl font-bold text-[#022b3a] mb-4">Chain of Custody Gaps</h3>
										<p className="text-[#022b3a]/80 leading-relaxed">Complete, transparent tracking of every evidence interaction and transfer.</p>
									</div>
								</div>
								
								<div className="group relative">
									<div className="absolute -inset-1 bg-gradient-to-r from-[#bfdbf7] to-[#1f7a8c] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
									<div className="relative text-center p-8 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#1f7a8c]/20 shadow-xl group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
										<div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">👤</div>
										<h3 className="text-xl font-bold text-[#022b3a] mb-4">Unauthorized Access</h3>
										<p className="text-[#022b3a]/80 leading-relaxed">Role-based access controls and cryptographic authentication ensure security.</p>
									</div>
								</div>
								
								<div className="group relative">
									<div className="absolute -inset-1 bg-gradient-to-r from-[#e1e5f2] to-[#1f7a8c] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
									<div className="relative text-center p-8 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#1f7a8c]/20 shadow-xl group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
										<div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🔥</div>
										<h3 className="text-xl font-bold text-[#022b3a] mb-4">Data Loss Risks</h3>
										<p className="text-[#022b3a]/80 leading-relaxed">Distributed storage across IPFS network ensures evidence permanence.</p>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Three-Tier Architecture Section */}
					<section id="architecture" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-br from-[#1f7a8c]/8 via-transparent to-[#022b3a]/8"></div>
						<div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[#1f7a8c]/15 to-transparent rounded-full blur-3xl"></div>
						<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-[#022b3a]/15 to-transparent rounded-full blur-3xl"></div>
						
						<div className="relative mx-auto max-w-7xl w-full">
							<div className="text-center mb-16">
								<div className="inline-flex items-center px-6 py-3 bg-[#1f7a8c]/10 rounded-full mb-6 border border-[#1f7a8c]/20">
									<span className="text-sm font-bold text-[#1f7a8c] tracking-wide">SECURE ARCHITECTURE</span>
								</div>
								<h2 className="text-3xl md:text-4xl font-black text-[#022b3a] mb-6">
									Three-Tier Architecture:<br />
									<span className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] bg-clip-text text-transparent">Secure by Design</span>
								</h2>
								<p className="text-lg text-[#022b3a] max-w-4xl mx-auto font-medium">
									Our unique architecture combines the best of traditional databases, decentralized storage, and blockchain technology.
								</p>
							</div>
							
							<div className="grid lg:grid-cols-3 gap-10">
								<div className="group relative">
									<div className="absolute -inset-2 bg-gradient-to-r from-[#1f7a8c] via-[#022b3a] to-[#bfdbf7] rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition duration-700"></div>
									<div className="relative text-center p-10 rounded-3xl bg-white/95 backdrop-blur-lg border border-[#1f7a8c]/20 shadow-2xl group-hover:shadow-3xl transform group-hover:scale-105 transition-all duration-500">
										<div className="absolute top-6 right-6 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
										<div className="text-6xl mb-8 transform group-hover:scale-110 transition-transform duration-500">📇</div>
										<h3 className="text-2xl font-black text-[#022b3a] mb-4">The Index</h3>
										<div className="inline-block px-6 py-2 bg-gradient-to-r from-[#1f7a8c]/20 to-[#022b3a]/20 rounded-full mb-6 border border-[#1f7a8c]/30">
											<p className="text-lg font-bold text-[#1f7a8c]">PostgreSQL Database</p>
										</div>
										<p className="text-[#022b3a] leading-relaxed font-medium">Fast, efficient searching and metadata management. Handles case information, officer details, and evidence indexing for lightning-quick queries.</p>
									</div>
								</div>
								
								<div className="group relative">
									<div className="absolute -inset-2 bg-gradient-to-r from-[#022b3a] via-[#bfdbf7] to-[#e1e5f2] rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition duration-700"></div>
									<div className="relative text-center p-10 rounded-3xl bg-white/95 backdrop-blur-lg border border-[#1f7a8c]/20 shadow-2xl group-hover:shadow-3xl transform group-hover:scale-105 transition-all duration-500">
										<div className="absolute top-6 right-6 w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
										<div className="text-6xl mb-8 transform group-hover:scale-110 transition-transform duration-500">🗄️</div>
										<h3 className="text-2xl font-black text-[#022b3a] mb-4">The Vault</h3>
										<div className="inline-block px-6 py-2 bg-gradient-to-r from-[#bfdbf7]/20 to-[#e1e5f2]/20 rounded-full mb-6 border border-[#1f7a8c]/30">
											<p className="text-lg font-bold text-[#1f7a8c]">IPFS Network</p>
										</div>
										<p className="text-[#022b3a] leading-relaxed font-medium">Resilient, distributed storage for evidence files. Content-addressed storage ensures data integrity and global accessibility without single points of failure.</p>
									</div>
								</div>
								
								<div className="group relative">
									<div className="absolute -inset-2 bg-gradient-to-r from-[#bfdbf7] via-[#e1e5f2] to-[#1f7a8c] rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition duration-700"></div>
									<div className="relative text-center p-10 rounded-3xl bg-white/95 backdrop-blur-lg border border-[#1f7a8c]/20 shadow-2xl group-hover:shadow-3xl transform group-hover:scale-105 transition-all duration-500">
										<div className="absolute top-6 right-6 w-3 h-3 bg-[#1f7a8c] rounded-full animate-pulse shadow-lg"></div>
										<div className="text-6xl mb-8 transform group-hover:scale-110 transition-transform duration-500">📜</div>
										<h3 className="text-2xl font-black text-[#022b3a] mb-4">The Notary</h3>
										<div className="inline-block px-6 py-2 bg-gradient-to-r from-[#1f7a8c]/20 to-[#022b3a]/20 rounded-full mb-6 border border-[#1f7a8c]/30">
											<p className="text-lg font-bold text-[#1f7a8c]">Hyperledger Fabric</p>
										</div>
										<p className="text-[#022b3a] leading-relaxed font-medium">Unbreakable, trusted proof of authenticity. Blockchain-based immutable ledger that cryptographically verifies every evidence transaction.</p>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* AI-Powered Features Section */}
					<section id="features" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
						<div className="absolute inset-0 bg-gradient-to-b from-white/90 to-[#e1e5f2]/40 backdrop-blur-sm"></div>
						<div className="relative mx-auto max-w-7xl w-full">
							<div className="text-center mb-16">
								<div className="inline-flex items-center px-6 py-3 bg-[#1f7a8c]/10 rounded-full mb-6 border border-[#1f7a8c]/20">
									<span className="text-sm font-bold text-[#1f7a8c] tracking-wide">AI-POWERED</span>
								</div>
								<h2 className="text-3xl md:text-4xl font-black text-[#022b3a] mb-6">
									AI-Powered<br />
									<span className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] bg-clip-text text-transparent">Intelligence Engine</span>
								</h2>
								<p className="text-lg text-[#022b3a] max-w-4xl mx-auto font-medium">
									Advanced machine learning algorithms provide intelligent insights and pattern recognition across your evidence database.
								</p>
							</div>
							
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
								<div className="group relative">
									<div className="absolute -inset-1 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
									<div className="relative p-8 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#1f7a8c]/20 shadow-xl group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
										<div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
											<Database className="h-8 w-8 text-white" />
										</div>
										<h3 className="text-xl font-bold text-[#022b3a] mb-4">Pattern Recognition</h3>
										<p className="text-[#022b3a]/80 leading-relaxed">Identify connections and patterns across cases that human investigators might miss.</p>
									</div>
								</div>
								
								<div className="group relative">
									<div className="absolute -inset-1 bg-gradient-to-r from-[#022b3a] to-[#bfdbf7] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
									<div className="relative p-8 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#1f7a8c]/20 shadow-xl group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
										<div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#022b3a] to-[#bfdbf7] rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
											<FileCheck className="h-8 w-8 text-white" />
										</div>
										<h3 className="text-xl font-bold text-[#022b3a] mb-4">Evidence Analysis</h3>
										<p className="text-[#022b3a]/80 leading-relaxed">Automated analysis of digital evidence with intelligent categorization and tagging.</p>
									</div>
								</div>
								
								<div className="group relative md:col-span-2 lg:col-span-1">
									<div className="absolute -inset-1 bg-gradient-to-r from-[#bfdbf7] to-[#1f7a8c] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
									<div className="relative p-8 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#1f7a8c]/20 shadow-xl group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
										<div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#bfdbf7] to-[#1f7a8c] rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
											<AlertTriangle className="h-8 w-8 text-white" />
										</div>
										<h3 className="text-xl font-bold text-[#022b3a] mb-4">Risk Assessment</h3>
										<p className="text-[#022b3a]/80 leading-relaxed">Real-time alerts for potential security breaches or chain of custody violations.</p>
									</div>
								</div>
							</div>
						</div>
					</section>
				</main>

				{/* Footer */}
				<Footer />
			</div>
		</>
	)
}