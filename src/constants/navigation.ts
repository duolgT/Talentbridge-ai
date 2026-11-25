import {
  LayoutDashboard,
  UserRound,
  Sparkles,
  FolderOpen,
  ClipboardCheck,
  ContactRound,
  ListChecks,
  BriefcaseBusiness,
  Settings,
} from 'lucide-react'

export const publicNavigation = [
  { label: 'Home', path: '/' },
  { label: 'How it works', path: '/#how-it-works' },
  { label: 'About us', path: '/about' },
]

export const candidateNavigation = [
  {
    label: 'Overview',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'My profile',
    path: '/profile',
    icon: UserRound,
  },
  {
    label: 'My skills',
    path: '/skills',
    icon: Sparkles,
  },
  {
    label: 'Evidence portfolio',
    path: '/evidence',
    icon: FolderOpen,
  },
  {
    label: 'Assessments',
    path: '/assessments',
    icon: ClipboardCheck,
  },
  {
    label: 'Digital passport',
    path: '/passport',
    icon: ContactRound,
  },
  {
    label: 'Work readiness',
    path: '/readiness',
    icon: ListChecks,
  },
  {
    label: 'Opportunities',
    path: '/opportunities',
    icon: BriefcaseBusiness,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
]