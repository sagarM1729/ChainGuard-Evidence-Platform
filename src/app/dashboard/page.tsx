"use client"

import { useSession } from "next-auth/react"
import { Files, Users, AlertCircle, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#022b3a] mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Officer'}!
        </h1>
        <p className="text-[#022b3a]/70">
          Here&apos;s what&apos;s happening with your evidence management today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#1f7a8c]/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#022b3a]/60 text-sm font-medium">Total Cases</p>
              <p className="text-2xl font-bold text-[#022b3a]">24</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-xl">
              <Files className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#1f7a8c]/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#022b3a]/60 text-sm font-medium">Evidence Items</p>
              <p className="text-2xl font-bold text-[#022b3a]">187</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#1f7a8c]/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#022b3a]/60 text-sm font-medium">Active Officers</p>
              <p className="text-2xl font-bold text-[#022b3a]">12</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#bfdbf7] to-[#1f7a8c] rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#1f7a8c]/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#022b3a]/60 text-sm font-medium">Pending Reviews</p>
              <p className="text-2xl font-bold text-[#022b3a]">8</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#1f7a8c] to-[#bfdbf7] rounded-xl">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#1f7a8c]/20 shadow-xl">
        <h2 className="text-xl font-bold text-[#022b3a] mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[#1f7a8c]/10">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#1f7a8c] rounded-full"></div>
              <div>
                <p className="font-medium text-[#022b3a]">New evidence uploaded to Case #2023-001</p>
                <p className="text-sm text-[#022b3a]/60">2 hours ago</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-[#1f7a8c]/10">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#022b3a] rounded-full"></div>
              <div>
                <p className="font-medium text-[#022b3a]">Case #2023-002 status updated to Closed</p>
                <p className="text-sm text-[#022b3a]/60">5 hours ago</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#bfdbf7] rounded-full"></div>
              <div>
                <p className="font-medium text-[#022b3a]">Chain of custody verified for Evidence #EV-001</p>
                <p className="text-sm text-[#022b3a]/60">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
