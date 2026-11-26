import HistorySection from './HistorySection'

interface ProfessionalHistoryProps {
  candidateId: string
}

export default function ProfessionalHistory({
  candidateId,
}: ProfessionalHistoryProps) {

  return (
    <div className="space-y-6">

      <HistorySection
        key={`${candidateId}-experiences`}
        kind="experiences"
        candidateId={candidateId}
      />

      <HistorySection
        key={`${candidateId}-education`}
        kind="education"
        candidateId={candidateId}
      />

    </div>
  )
}