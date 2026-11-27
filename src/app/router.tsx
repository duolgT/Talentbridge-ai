import { createBrowserRouter } from 'react-router-dom'

// Authentication and authorization

import ProtectedRoute from '../features/auth/ProtectedRoute'
import RoleGuard from '../features/auth/RoleGuard'

// Layouts

import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import EmployerLayout from '../layouts/EmployerLayout'

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
import OpportunitiesPage from '../pages/candidate/OpportunitiesPage'

// Reviewer pages

import ReviewerDashboard from '../pages/reviewer/ReviewerDashboard'

// Employer pages

import EmployerDashboard from '../pages/employer/EmployerDashboard'
import CreateOpportunityPage from '../pages/employer/CreateOpportunityPage'
import ManageOpportunitiesPage from '../pages/employer/ManageOpportunitiesPage'

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
    path: 'settings',
    title: 'Account settings',
    description:
      'Manage your account preferences, privacy and security.',
  },

]

// Remaining employer placeholders

const employerPages = [

  {
    path: 'applications',
    title: 'Manage applications',
    description:
      'Review applications submitted to your opportunities. This feature is currently under development.',
  },

  {
    path: 'verify',
    title: 'Verify Skills Passport',
    description:
      'Validate Digital Skills Passports voluntarily shared by candidates.',
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

      // Shared account profile

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
            path: 'employer',
            element: <EmployerLayout />,

            children: [

              {
                index: true,
                element: <EmployerDashboard />,
              },

              {
                path: 'dashboard',
                element: <EmployerDashboard />,
              },

              // Manage opportunities

              {
                path: 'opportunities',
                element: <ManageOpportunitiesPage />,
              },

              // Create opportunity

              {
                path: 'opportunities/create',
                element: <CreateOpportunityPage />,
              },

              // Edit existing draft

              {
                path: 'opportunities/:id/edit',
                element: <CreateOpportunityPage />,
              },

              // Remaining employer features

              ...employerPages.map((page) => ({

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
  // PAGE NOT FOUND
  // ==========================================

  {
    path: '*',
    element: <NotFoundPage />,
  },

])