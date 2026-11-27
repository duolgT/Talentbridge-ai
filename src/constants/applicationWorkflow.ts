import type {
  ApplicationTransitionMap,
} from '../types/employer'

export const APPLICATION_TRANSITIONS:
  ApplicationTransitionMap = {

  submitted: [
    'under_review',
    'rejected',
  ],

  under_review: [
    'shortlisted',
    'rejected',
  ],

  shortlisted: [
    'accepted',
    'rejected',
  ],

  accepted: [],

  rejected: [],

  withdrawn: [],
}

export const APPLICATION_STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under review',
  shortlisted: 'Shortlisted',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const APPLICATION_ACTION_LABELS = {
  under_review: 'Start review',
  shortlisted: 'Shortlist candidate',
  accepted: 'Accept application',
  rejected: 'Reject application',
}