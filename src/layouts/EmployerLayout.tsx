import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import EmployerSidebar from '../components/employer/EmployerSidebar'
import EmployerHeader from '../components/employer/EmployerHeader'

export default function EmployerLayout() {

  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  return (

    <div className="min-h-screen bg-[#F6F8F5]">

      {/* Employer sidebar */}

      <EmployerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main workspace */}

      <div className="min-h-screen min-w-0 lg:ml-72">

        <EmployerHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main
          id="employer-main-content"
          className="min-w-0 p-4 sm:p-6 lg:p-8"
        >

          <Outlet />

        </main>

      </div>

    </div>

  )
}