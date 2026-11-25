import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Sidebar from '../components/navigation/Sidebar'
import DashboardHeader from '../components/navigation/DashboardHeader'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-72">

        <DashboardHeader
          menuOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">

          <Outlet />

        </main>

      </div>

    </div>
  )
}