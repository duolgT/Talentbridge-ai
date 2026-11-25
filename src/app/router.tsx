import { createBrowserRouter } from 'react-router-dom'

// Authentication
import ProtectedRoute from '../features/auth/ProtectedRoute'
import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'

// Layouts
import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'

// Public pages
import HomePage from '../pages/public/HomePage'
import AboutPage from '../pages/public/AboutPage'
import NotFoundPage from '../pages/public/NotFoundPage'

// Candidate pages
import DashboardPage from '../pages/candidate/DashboardPage'
import ProfilePage from '../pages/candidate/ProfilePage'

import PlaceholderPage from '../pages/PlaceholderPage'

// Pages awaiting implementation
const candidatePages = [
  {
    path: 'skills',
    title: 'AI skills mapping',
    description: 'Discover competencies from your professional experience.',
  },
  {
    path: 'evidence',
    title: 'Evidence portfolio',
    description: 'Manage work samples, certificates and references.',
  },
  {
    path: 'assessments',
    title: 'Skills assessments',
    description: 'Demonstrate your professional abilities.',
  },
  {
    path: 'passport',
    title: 'Digital skills passport',
    description: 'Build and share your professional evidence.',
  },
  {
    path: 'readiness',
    title: 'Employment readiness',
    description: 'Prepare for lawful employment and documentation requirements.',
  },
  {
    path: 'opportunities',
    title: 'Professional opportunities',
    description: 'Discover relevant skills-based opportunities.',
  },
  {
    path: 'settings',
    title: 'Account settings',
    description: 'Manage your account preferences.',
  },
]

export const router = createBrowserRouter([

  // Authentication routes

  {
    path: '/register',
    element: <RegisterPage />,
  },

  {
    path: '/login',
    element: <LoginPage />,
  },

  // Public routes

  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
    ],
  },

  // Protected candidate routes

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [

          // Functional dashboard
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },

          // Functional professional profile
          {
            path: 'profile',
            element: <ProfilePage />,
          },

          // Remaining placeholder pages
          ...candidatePages.map((page) => ({
            path: page.path,
            element: (
              <PlaceholderPage
                title={page.title}
                description={page.description}
              />
            ),
          })),

        ],
      },
    ],
  },

  // 404 fallback

  {
    path: '*',
    element: <NotFoundPage />,
  },

])