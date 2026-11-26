import type {
  ReadinessTask,
} from '../types/readiness'

export const READINESS_TASKS:
  Omit<ReadinessTask, 'completed'>[] = [

  {
    key: 'profile_completed',
    title: 'Complete your professional profile',
    description:
      'Add your full name, professional title, biography, country and location.',
    points: 20,
    category: 'profile',
    type: 'automatic',
    actionLabel: 'Complete profile',
    actionPath: '/profile',
  },

  {
    key: 'history_documented',
    title: 'Document your professional history',
    description:
      'Add at least one employment, education or training record.',
    points: 10,
    category: 'history',
    type: 'automatic',
    actionLabel: 'Manage professional history',
    actionPath: '/profile',
  },

  {
    key: 'skills_identified',
    title: 'Identify your professional skills',
    description:
      'Add at least one relevant professional competency.',
    points: 10,
    category: 'credentials',
    type: 'automatic',
    actionLabel: 'Manage skills',
    actionPath: '/skills',
  },

  {
    key: 'evidence_uploaded',
    title: 'Upload supporting evidence',
    description:
      'Attach a professional certificate, work sample or reference.',
    points: 10,
    category: 'credentials',
    type: 'automatic',
    actionLabel: 'Upload evidence',
    actionPath: '/evidence',
  },

  {
    key: 'skills_verified',
    title: 'Verify your professional competencies',
    description:
      'Obtain reviewer approval for at least one professional skill.',
    points: 10,
    category: 'credentials',
    type: 'automatic',
    actionLabel: 'Manage verification',
    actionPath: '/evidence',
  },

  {
    key: 'passport_generated',
    title: 'Generate your Digital Skills Passport',
    description:
      'Create your professional credential passport. Publishing is optional.',
    points: 10,
    category: 'career',
    type: 'automatic',
    actionLabel: 'Generate passport',
    actionPath: '/passport',
  },

  {
    key: 'cv_prepared',
    title: 'Prepare a professional CV',
    description:
      'Create an updated CV highlighting your relevant experience and skills.',
    points: 5,
    category: 'career',
    type: 'manual',
  },

  {
    key: 'interview_prepared',
    title: 'Prepare for job interviews',
    description:
      'Practice common interview questions and prepare examples of your achievements.',
    points: 5,
    category: 'career',
    type: 'manual',
  },

  {
    key: 'employment_information_reviewed',
    title: 'Review employment information',
    description:
      'Consult reliable employment information or qualified legal and humanitarian support services.',
    points: 5,
    category: 'career',
    type: 'manual',
  },

  {
    key: 'career_goals_defined',
    title: 'Define your career goals',
    description:
      'Identify your preferred profession and short-term career objectives.',
    points: 5,
    category: 'career',
    type: 'manual',
  },

  {
    key: 'opportunity_preferences_defined',
    title: 'Define opportunity preferences',
    description:
      'Identify preferred industries, work arrangements and locations.',
    points: 5,
    category: 'career',
    type: 'manual',
  },

  {
    key: 'references_prepared',
    title: 'Prepare professional references',
    description:
      'Identify people who can support your professional applications and obtain their consent.',
    points: 5,
    category: 'career',
    type: 'manual',
  },

]