import { createBrowserRouter } from 'react-router-dom'
import EvidencePage from '../pages/candidate/EvidencePage'

import PassportPage from '../pages/candidate/PassportPage'

import VerifyPassportPage from '../pages/public/VerifyPassportPage'

import ReviewerDashboard from '../pages/reviewer/ReviewerDashboard'

import SkillsPage from '../pages/candidate/SkillsPage'

// Authentication and authorization
import ProtectedRoute from '../features/auth/ProtectedRoute'
import RoleGuard from '../features/auth/RoleGuard'

// Layouts
import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'

// Public pages
import HomePage from '../pages/public/HomePage'
import AboutPage from '../pages/public/AboutPage'
import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'
import NotFoundPage from '../pages/public/NotFoundPage'
import UnauthorizedPage from '../pages/public/UnauthorizedPage'

// Candidate pages
import DashboardPage from '../pages/candidate/DashboardPage'
import ProfilePage from '../pages/candidate/ProfilePage'

// Shared pages
import SharedProfilePage from '../pages/SharedProfilePage'
import RoleDashboard from '../pages/RoleDashboard'
import PlaceholderPage from '../pages/PlaceholderPage'

// Pages awaiting implementation
const candidatePages = [
  
  
  {
    path: 'assessments',
    title: 'Skills assessments',
    description:
      'Demonstrate your professional abilities.',
  },
  
  {
    path: 'readiness',
    title: 'Employment readiness',
    description:
      'Prepare for lawful employment and documentation requirements.',
  },
  {
    path: 'opportunities',
    title: 'Professional opportunities',
    description:
      'Discover relevant skills-based opportunities.',
  },
  {
    path: 'settings',
    title: 'Account settings',
    description:
      'Manage your account preferences.',
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

  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
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

  // Authenticated routes

  {
    element: <ProtectedRoute />,

    children: [

      // Shared profile for all authenticated roles

      {
        path: 'account/profile',
        element: <SharedProfilePage />,
      },

      // Candidate routes

      {
        element: (
          <RoleGuard allowedRoles={['candidate']} />
        ),

        children: [
          {
            element: <DashboardLayout />,

            children: [
              {
                path: 'dashboard',
                element: <DashboardPage />,
              },

              {
                path: 'profile',
                element: <ProfilePage />,
              },
              {
  path: 'skills',
  element: <SkillsPage />,
},

 {
    path: 'evidence',
    element: <EvidencePage />,
  },

  {
  path: 'passport',
  element: <PassportPage />,
},


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

      // Reviewer routes

      {
  path: '/verify/:token',
  element: <VerifyPassportPage />,
},

      {
  element: (
    <RoleGuard allowedRoles={['reviewer']} />
  ),

  children: [
    {
      path: 'reviewer/dashboard',
      element: <ReviewerDashboard />,
    },
  ],
},

      // Employer routes

      {
        element: (
          <RoleGuard allowedRoles={['employer']} />
        ),

        children: [
          {
            path: 'employer/dashboard',
            element: (
              <RoleDashboard role="employer" />
            ),
          },
        ],
      },

      // Administrator routes

      {
        element: (
          <RoleGuard allowedRoles={['admin']} />
        ),

        children: [
          {
            path: 'admin/dashboard',
            element: (
              <RoleDashboard role="admin" />
            ),
          },
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