import type {
  CandidateSkill,
} from '../types/skills'

import type {
  Opportunity,
  OpportunityMatch,
} from '../types/opportunity'

export function calculateOpportunityMatch(
  opportunity: Opportunity,
  candidateSkills: CandidateSkill[]
): OpportunityMatch {

  const candidateSkillMap = new Map(
    candidateSkills.map((skill) => [
      skill.skill_id,
      skill,
    ])
  )

  const listedSkills =
    opportunity.opportunity_skills

  const requiredSkills = listedSkills.filter(
    (skill) => skill.is_required
  )

  const matchedSkills = listedSkills.filter(
    (skill) =>
      candidateSkillMap.has(skill.skill_id)
  )

  const verifiedMatches = matchedSkills.filter(
    (skill) =>
      candidateSkillMap.get(skill.skill_id)
        ?.status === 'verified'
  )

  const selfReportedMatches = matchedSkills.filter(
    (skill) =>
      candidateSkillMap.get(skill.skill_id)
        ?.status !== 'verified'
  )

  const missingRequiredSkills = listedSkills.filter(
    (skill) =>
      skill.is_required &&
      !candidateSkillMap.has(skill.skill_id)
  )

  const missingPreferredSkills = listedSkills.filter(
    (skill) =>
      !skill.is_required &&
      !candidateSkillMap.has(skill.skill_id)
  )

  const matchedRequiredCount =
    requiredSkills.length -
    missingRequiredSkills.length

  const matchPercentage =
    listedSkills.length > 0
      ? Math.round(
          matchedSkills.length /
          listedSkills.length * 100
        )
      : null

  const requiredCoverage =
    requiredSkills.length > 0
      ? Math.round(
          matchedRequiredCount /
          requiredSkills.length * 100
        )
      : null

  return {
    opportunity,
    matchPercentage,
    requiredCoverage,
    matchedSkills,
    verifiedMatches,
    selfReportedMatches,
    missingRequiredSkills,
    missingPreferredSkills,
  }
}

export function matchOpportunities(
  opportunities: Opportunity[],
  candidateSkills: CandidateSkill[]
): OpportunityMatch[] {

  return opportunities
    .map((opportunity) =>
      calculateOpportunityMatch(
        opportunity,
        candidateSkills
      )
    )
    .sort(
      (a, b) =>
        (b.matchPercentage ?? -1) -
        (a.matchPercentage ?? -1) ||

        a.opportunity.title.localeCompare(
          b.opportunity.title
        )
    )
}