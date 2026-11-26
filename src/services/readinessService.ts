import { supabase } from '../lib/supabase'

import {
  getUserProfile,
} from './authService'

import {
  getHistory,
} from './historyService'

import {
  getCandidateSkills,
} from './skillService'

import {
  getEvidence,
} from './evidenceService'

import {
  getPassport,
} from './passportService'

import type {
  ReadinessProgress,
  ReadinessSnapshot,
  ManualTaskKey,
} from '../types/readiness'

// Retrieve self-reported progress

export async function getReadinessProgress(
  candidateId: string
): Promise<ReadinessProgress[]> {

  const { data, error } = await supabase
    .from('readiness_progress')
    .select('*')
    .eq('candidate_id', candidateId)

  if (error) throw error

  return data as ReadinessProgress[]
}

// Complete a manual task

export async function completeReadinessTask(
  candidateId: string,
  taskKey: ManualTaskKey
) {

  const { error } = await supabase
    .from('readiness_progress')
    .insert({
      candidate_id: candidateId,
      task_key: taskKey,
    })

  // Duplicate record means the task
  // was already completed.

  if (error && error.code !== '23505') {
    throw error
  }
}

// Reset a manual task

export async function resetReadinessTask(
  candidateId: string,
  taskKey: ManualTaskKey
) {

  const { error } = await supabase
    .from('readiness_progress')
    .delete()
    .eq('candidate_id', candidateId)
    .eq('task_key', taskKey)

  if (error) throw error
}

// Collect current preparation data

export async function getReadinessSnapshot(
  candidateId: string
): Promise<ReadinessSnapshot> {

  const [
    profile,
    experiences,
    education,
    skills,
    evidence,
    passport,
    progress,
  ] = await Promise.all([

    getUserProfile(candidateId),

    getHistory(
      'experiences',
      candidateId
    ),

    getHistory(
      'education',
      candidateId
    ),

    getCandidateSkills(candidateId),

    getEvidence(candidateId),

    getPassport(candidateId),

    getReadinessProgress(candidateId),

  ])

  const requiredProfileFields = [
    profile.full_name,
    profile.professional_title,
    profile.bio,
    profile.country,
    profile.location,
  ]

  const profileCompleted =
    requiredProfileFields.every(
      (field) => Boolean(field?.trim())
    )

  const verifiedSkills = skills.filter(
    (skill) =>
      skill.status === 'verified' &&

      evidence.some(
        (record) =>
          record.candidate_skill_id === skill.id &&
          record.status === 'approved'
      )
  )

  return {

    profileCompleted,

    experienceCount:
      experiences.length,

    educationCount:
      education.length,

    skillCount:
      skills.length,

    evidenceCount:
      evidence.length,

    verifiedSkillCount:
      verifiedSkills.length,

    passportGenerated:
      Boolean(passport),

    completedManualTasks:
      progress.map(
        (record) => record.task_key
      ),

  }
}