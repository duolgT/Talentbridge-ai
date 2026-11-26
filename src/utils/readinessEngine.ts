import {
  READINESS_TASKS,
} from '../constants/readiness'

import type {
  ReadinessSnapshot,
  ReadinessResult,
  ReadinessTask,
  ReadinessTaskKey,
} from '../types/readiness'

export function calculateReadiness(
  snapshot: ReadinessSnapshot
): ReadinessResult {

  const automaticTasks:
    Partial<Record<ReadinessTaskKey, boolean>> = {

    profile_completed:
      snapshot.profileCompleted,

    history_documented:
      snapshot.experienceCount > 0 ||
      snapshot.educationCount > 0,

    skills_identified:
      snapshot.skillCount > 0,

    evidence_uploaded:
      snapshot.evidenceCount > 0,

    skills_verified:
      snapshot.verifiedSkillCount > 0,

    passport_generated:
      snapshot.passportGenerated,

  }

  const completedManualTasks = new Set<
    ReadinessTaskKey
  >(
    snapshot.completedManualTasks
  )

  const tasks: ReadinessTask[] =
    READINESS_TASKS.map((task) => ({

      ...task,

      completed:
        task.type === 'automatic'
          ? Boolean(automaticTasks[task.key])
          : completedManualTasks.has(task.key),

    }))

  const completedTasks = tasks.filter(
    (task) => task.completed
  )

  const earnedPoints = completedTasks.reduce(
    (total, task) => total + task.points,
    0
  )

  const maximumPoints = tasks.reduce(
    (total, task) => total + task.points,
    0
  )

  const score = maximumPoints > 0
    ? Math.round(
        (earnedPoints / maximumPoints) * 100
      )
    : 0

  const recommendations = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)

  return {
    score,
    completedCount: completedTasks.length,
    totalTasks: tasks.length,
    tasks,
    recommendations,
  }
}

export function getReadinessLabel(
  score: number
): string {

  if (score >= 100) {
    return 'Checklist completed'
  }

  if (score >= 70) {
    return 'Preparation well underway'
  }

  if (score >= 40) {
    return 'Building your pathway'
  }

  return 'Getting started'
}