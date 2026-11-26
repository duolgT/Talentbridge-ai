import { createBrowserRouter } from 'react-router-dom'

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
import VerifyPassportPage from '../pages/public/VerifyPassportPage'

// Candidate pages

import DashboardPage from '../pages/candidate/DashboardPage'
import ProfilePage from '../pages/candidate/ProfilePage'
import SkillsPage from '../pages/candidate/SkillsPage'
import EvidencePage from '../pages/candidate/EvidencePage'
import PassportPage from '../pages/candidate/PassportPage'
import ReadinessPage from '../pages/candidate/ReadinessPage'

// Reviewer pages

import ReviewerDashboard from '../pages/reviewer/ReviewerDashboard'

// Shared pages

import SharedProfilePage from '../pages/SharedProfilePage'
import RoleDashboard from '../pages/RoleDashboard'
import PlaceholderPage from '../pages/PlaceholderPage'

// Remaining candidate placeholders

const candidatePages = [
  {
    path: 'assessments',
    title: 'Skills assessments',
    description:
      'Demonstrate your professional competencies through practical assessments.',
  },
  {
    path: 'opportunities',
    title: 'Opportunity matching',
    description:
      'Discover employment and training opportunities aligned with your professional skills.',
  },
  {
    path: 'settings',
    title: 'Account settings',
    description:
      'Manage your account preferences, privacy and security.',
  },
]

// Application router

export const router = createBrowserRouter([

  // ==========================================
  // PUBLIC AUTHENTICATION ROUTES
  // ==========================================

  {
    path: '/login',
    element: <LoginPage />,
  },

  {
    path: '/register',
    element: <RegisterPage />,
  },

  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },

  // ==========================================
  // PUBLIC PASSPORT VERIFICATION
  // ==========================================

  {
    path: '/verify/:token',
    element: <VerifyPassportPage />,
  },

  // ==========================================
  // PUBLIC WEBSITE
  // ==========================================

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

  // ==========================================
  // PROTECTED APPLICATION ROUTES
  // ==========================================

  {
    element: <ProtectedRoute />,

    children: [

      // ======================================
      // SHARED ACCOUNT PROFILE
      // ======================================

      {
        path: '/account/profile',
        element: <SharedProfilePage />,
      },

      // ======================================
      // CANDIDATE ROUTES
      // ======================================

      {
        element: (
          <RoleGuard allowedRoles={['candidate']} />
        ),

        children: [
          {
            element: <DashboardLayout />,

            children: [

              // Candidate dashboard

              {
                path: 'dashboard',
                element: <DashboardPage />,
              },

              // Professional profile

              {
                path: 'profile',
                element: <ProfilePage />,
              },

              // Skills mapping engine

              {
                path: 'skills',
                element: <SkillsPage />,
              },

              // Evidence portfolio

              {
                path: 'evidence',
                element: <EvidencePage />,
              },

              // Digital Skills Passport

              {
                path: 'passport',
                element: <PassportPage />,
              },

              // Employment Readiness Engine

              {
                path: 'readiness',
                element: <ReadinessPage />,
              },

              // Features under development

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

      // ======================================
      // REVIEWER ROUTES
      // ======================================

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

      // ======================================
      // EMPLOYER ROUTES
      // ======================================

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

      // ======================================
      // ADMINISTRATOR ROUTES
      // ======================================

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

  // ==========================================
  // 404 — PAGE NOT FOUND
  // ==========================================

  {
    path: '*',
    element: <NotFoundPage />,
  },

])