import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  History,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

export interface AdminNavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

export const adminNavigation:
  AdminNavigationItem[] = [

  {
    label: 'Overview',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },

  {
    label: 'User management',
    path: '/admin/users',
    icon: Users,
  },

  {
    label: 'Reviewer management',
    path: '/admin/reviewers',
    icon: ShieldCheck,
  },

  {
    label: 'Opportunity oversight',
    path: '/admin/opportunities',
    icon: BriefcaseBusiness,
  },

  {
    label: 'Platform analytics',
    path: '/admin/analytics',
    icon: ChartNoAxesCombined,
  },

  {
    label: 'Audit logs',
    path: '/admin/audit-logs',
    icon: History,
  },

  {
    label: 'My profile',
    path: '/account/profile',
    icon: UserRound,
  },

]