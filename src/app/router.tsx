import { createBrowserRouter } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'

import HomePage from '../pages/public/HomePage'
import AboutPage from '../pages/public/AboutPage'
import NotFoundPage from '../pages/public/NotFoundPage'

import DashboardPage from '../pages/candidate/DashboardPage'
import PlaceholderPage from '../pages/PlaceholderPage'

const candidatePages = [
  {
    path: 'profile',
    title: 'Professional profile',
    description: 'Manage your education and professional experience.',
  },
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
      {
        path: 'login',
        element: (
          <PlaceholderPage
            title="Sign in"
            description="Authentication will be connected in Phase 3."
            backTo="/"
          />
        ),
      },
      {
        path: 'register',
        element: (
          <PlaceholderPage
            title="Create your account"
            description="Candidate registration will be connected in Phase 3."
            backTo="/"
          />
        ),
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
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
  {
    path: '*',
    element: <NotFoundPage />,
  },
])