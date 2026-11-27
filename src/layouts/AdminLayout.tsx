import {
  useEffect,
  useState,
} from 'react'

import {
  Outlet,
} from 'react-router-dom'

import AdminSidebar from '../components/admin/AdminSidebar'
import AdminHeader from '../components/admin/AdminHeader'

export default function AdminLayout() {

  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  // Close the mobile sidebar using Escape.

  useEffect(() => {

    if (!sidebarOpen) return

    function handleKeyDown(
      event: KeyboardEvent
    ) {

      if (event.key === 'Escape') {
        setSidebarOpen(false)
      }

    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {

      window.removeEventListener(
        'keydown',
        handleKeyDown
      )

    }

  }, [sidebarOpen])

  return (

    <div className="min-h-screen bg-[#F6F8F5]">

      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-lg focus:bg-white focus:p-3"
      >

        Skip to main content

      </a>

      <AdminSidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="min-w-0 lg:ml-72">

        <AdminHeader
          menuOpen={sidebarOpen}
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main
          id="admin-main"
          tabIndex={-1}
          className="min-h-[calc(100vh-73px)] p-4 outline-none sm:p-6 lg:p-8"
        >

          <Outlet />

        </main>

      </div>

    </div>

  )
}