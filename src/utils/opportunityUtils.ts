export function isDeadlinePassed(
  deadline: string | null
): boolean {

  if (!deadline) return false

  const parts = new Intl.DateTimeFormat(
    'en-GB',
    {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  ).formatToParts(new Date())

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value

  const today = [
    getPart('year'),
    getPart('month'),
    getPart('day'),
  ].join('-')

  return deadline < today
}