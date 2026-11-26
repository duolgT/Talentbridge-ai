interface ReadinessGaugeProps {
  score: number
  size?: number
}

export default function ReadinessGauge({
  score,
  size = 160,
}: ReadinessGaugeProps) {

  const safeScore = Math.min(
    100,
    Math.max(0, score)
  )

  const radius = 52

  const circumference =
    2 * Math.PI * radius

  const offset =
    circumference -
    (safeScore / 100) * circumference

  return (

    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={
        `${safeScore}% preparation completed`
      }
      className="max-w-full"
    >

      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="9"
        fill="none"
      />

      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="#D5F76A"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
        className="transition-all duration-700 ease-out motion-reduce:transition-none"
      />

      <text
        x="60"
        y="58"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        fontSize="27"
        fontWeight="800"
      >
        {safeScore}%
      </text>

      <text
        x="60"
        y="77"
        textAnchor="middle"
        fill="#D5F76A"
        fontSize="8"
        fontWeight="600"
      >
        COMPLETED
      </text>

    </svg>
  )
}