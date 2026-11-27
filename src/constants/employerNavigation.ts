import {
  LayoutDashboard,
  BriefcaseBusiness,
  CirclePlus,
  Users,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

export interface EmployerNavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

export const employerNavigation: EmployerNavigationItem[] = [
  {
    label: 'Overview',
    path: '/employer/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Manage opportunities',
    path: '/employer/opportunities',
    icon: BriefcaseBusiness,
  },
  {
    label: 'Create opportunity',
    path: '/employer/opportunities/create',
    icon: CirclePlus,
  },
  {
    label: 'Applications',
    path: '/employer/applications',
    icon: Users,
  },
  {
    label: 'Verify passport',
    path: '/employer/verify',
    icon: ShieldCheck,
  },
  {
    label: 'My profile',
    path: '/account/profile',
    icon: UserRound,
  },
]