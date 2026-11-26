import type {
  Experience,
  Education,
} from '../types/professional'

import type {
  Skill,
  SkillSuggestion,
} from '../types/skills'

interface TextSource {
  label: string
  content: string
}

function normalizeText(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegex(text: string): string {
  return text.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  )
}

function containsKeyword(
  text: string,
  keyword: string
): boolean {

  const normalizedKeyword =
    normalizeText(keyword)

  if (!normalizedKeyword) return false

  const pattern = new RegExp(
    `(^|[^\\p{L}\\p{N}_])${escapeRegex(
      normalizedKeyword
    )}(?=$|[^\\p{L}\\p{N}_])`,
    'u'
  )

  return pattern.test(
    normalizeText(text)
  )
}

export function mapSkills(
  catalogue: Skill[],
  experiences: Experience[],
  education: Education[],
  biography = '',
  professionalTitle = ''
): SkillSuggestion[] {

  const sources: TextSource[] = [

    {
      label: 'Professional biography',
      content: biography,
    },

    {
      label: 'Professional title',
      content: professionalTitle,
    },

    ...experiences.map((experience) => ({
      label: experience.job_title,

      content: [
        experience.job_title,
        experience.description,
      ]
        .filter(Boolean)
        .join(' '),
    })),

    ...education.map((record) => ({
      label: record.qualification,

      content: [
        record.qualification,
        record.field_of_study,
        record.description,
      ]
        .filter(Boolean)
        .join(' '),
    })),
  ]

  const suggestions: SkillSuggestion[] = []

  for (const skill of catalogue) {

    const matchedKeywords = new Set<string>()
    const matchedSources = new Set<string>()

    for (const source of sources) {

      for (const keyword of skill.keywords) {

        if (
          containsKeyword(
            source.content,
            keyword
          )
        ) {
          matchedKeywords.add(keyword)
          matchedSources.add(source.label)
        }

      }

    }

    if (matchedKeywords.size > 0) {

      suggestions.push({
        skill,

        matchedKeywords: [
          ...matchedKeywords,
        ],

        matchedSources: [
          ...matchedSources,
        ],
      })

    }

  }

  return suggestions.sort(
    (a, b) =>
      b.matchedSources.length -
        a.matchedSources.length ||

      b.matchedKeywords.length -
        a.matchedKeywords.length ||

      a.skill.name.localeCompare(b.skill.name)
  )
}