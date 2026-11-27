import {
  createBrowserRouter,
  Navigate,
} from 'react-router-dom'

// ==========================================
// AUTHENTICATION
// ==========================================

import ProtectedRoute from '../features/auth/ProtectedRoute'
import RoleGuard from '../features/auth/RoleGuard'

// ==========================================
// LAYOUTS
// ==========================================

import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import EmployerLayout from '../layouts/EmployerLayout'
import AdminLayout from '../layouts/AdminLayout'

// ==========================================
// PUBLIC PAGES
// ==========================================

import HomePage from '../pages/public/HomePage'
import AboutPage from '../pages/public/AboutPage'
import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'
import NotFoundPage from '../pages/public/NotFoundPage'
import UnauthorizedPage from '../pages/public/UnauthorizedPage'
import VerifyPassportPage from '../pages/public/VerifyPassportPage'

// ==========================================
// CANDIDATE PAGES
// ==========================================

import DashboardPage from '../pages/candidate/DashboardPage'
import ProfilePage from '../pages/candidate/ProfilePage'
import SkillsPage from '../pages/candidate/SkillsPage'
import EvidencePage from '../pages/candidate/EvidencePage'
import PassportPage from '../pages/candidate/PassportPage'
import ReadinessPage from '../pages/candidate/ReadinessPage'
import OpportunitiesPage from '../pages/candidate/OpportunitiesPage'

// ==========================================
// REVIEWER PAGES
// ==========================================

import ReviewerDashboard from '../pages/reviewer/ReviewerDashboard'

// ==========================================
// EMPLOYER PAGES
// ==========================================

import EmployerDashboard from '../pages/employer/EmployerDashboard'
import CreateOpportunityPage from '../pages/employer/CreateOpportunityPage'
import ManageOpportunitiesPage from '../pages/employer/ManageOpportunitiesPage'
import EmployerApplicationsPage from '../pages/employer/EmployerApplicationsPage'
import EmployerVerifyPage from '../pages/employer/EmployerVerifyPage'

// ==========================================
// ADMINISTRATOR PAGES
// ==========================================

import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminReviewersPage from '../pages/admin/AdminReviewersPage'
import AdminOpportunitiesPage from '../pages/admin/AdminOpportunitiesPage'
import AdminAuditLogsPage from '../pages/admin/AdminAuditLogsPage'
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage'

// ==========================================
// SHARED PAGES
// ==========================================

import SharedProfilePage from '../pages/SharedProfilePage'
import PlaceholderPage from '../pages/PlaceholderPage'

// ==========================================
// CANDIDATE PLACEHOLDERS
// ==========================================

const candidatePages = [
  {
    path: 'assessments',
    title: 'Skills assessments',
    description:
      'Demonstrate your professional competencies through practical assessments.',
  },
  {
    path: 'settings',
    title: 'Account settings',
    description:
      'Manage your account preferences, privacy and security.',
  },
]

// ==========================================
// APPLICATION ROUTER
// ==========================================

export const router = createBrowserRouter([

  // ========================================
  // PUBLIC AUTHENTICATION
  // ========================================

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

  // ========================================
  // PUBLIC PASSPORT VERIFICATION
  // ========================================

  {
    path: '/verify/:token',
    element: <VerifyPassportPage />,
  },

  // ========================================
  // PUBLIC WEBSITE
  // ========================================

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

  // ========================================
  // PROTECTED APPLICATION
  // ========================================

  {
    element: <ProtectedRoute />,

    children: [

      // Shared account profile

      {
        path: '/account/profile',
        element: <SharedProfilePage />,
      },

      // ====================================
      // CANDIDATE ROUTES
      // ====================================

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

              {
                path: 'readiness',
                element: <ReadinessPage />,
              },

              {
                path: 'opportunities',
                element: <OpportunitiesPage />,
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

      // ====================================
      // REVIEWER ROUTES
      // ====================================

      {
        element: (
          <RoleGuard allowedRoles={['reviewer']} />
        ),

        children: [

          {
            path: 'reviewer',

            children: [

              {
                index: true,
                element: (
                  <Navigate to="dashboard" replace />
                ),
              },

              {
                path: 'dashboard',
                element: <ReviewerDashboard />,
              },

            ],
          },

        ],
      },

      // ====================================
      // EMPLOYER ROUTES
      // ====================================

      {
        element: (
          <RoleGuard allowedRoles={['employer']} />
        ),

        children: [

          {
            path: 'employer',
            element: <EmployerLayout />,

            children: [

              {
                index: true,
                element: (
                  <Navigate to="dashboard" replace />
                ),
              },

              {
                path: 'dashboard',
                element: <EmployerDashboard />,
              },

              {
                path: 'opportunities',
                element: <ManageOpportunitiesPage />,
              },

              {
                path: 'opportunities/create',
                element: <CreateOpportunityPage />,
              },

              {
                path: 'opportunities/:id/edit',
                element: <CreateOpportunityPage />,
              },

              {
                path: 'applications',
                element: <EmployerApplicationsPage />,
              },

              {
                path: 'verify',
                element: <EmployerVerifyPage />,
              },

            ],
          },

        ],
      },

      // ====================================
      // ADMINISTRATOR ROUTES
      // ====================================

      {
        element: (
          <RoleGuard allowedRoles={['admin']} />
        ),

        children: [

          {
            path: 'admin',
            element: <AdminLayout />,

            children: [

              {
                index: true,
                element: (
                  <Navigate to="dashboard" replace />
                ),
              },

              {
                path: 'dashboard',
                element: <AdminDashboard />,
              },

              {
                path: 'users',
                element: <AdminUsersPage />,
              },

              {
                path: 'reviewers',
                element: <AdminReviewersPage />,
              },

              {
                path: 'opportunities',
                element: <AdminOpportunitiesPage />,
              },

              {
                path: 'analytics',
                element: <AdminAnalyticsPage />,
              },

              {
                path: 'audit-logs',
                element: <AdminAuditLogsPage />,
              },

            ],
          },

        ],
      },

    ],
  },

  // ========================================
  // PAGE NOT FOUND
  // ========================================

  {
    path: '*',
    element: <NotFoundPage />,
  },

])