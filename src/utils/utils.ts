export function prettifyDate(date: Date) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const daysAgo = Math.round(
    (new Date().getTime() - date.getTime()) / (1000 * 3600 * 24),
  )
  if (daysAgo > 30) {
    return `${date.getDate()} ${months[date.getMonth() + 1]}`
  }
  return `${daysAgo}d ago`
}

export function copy(content: string) {
  navigator.clipboard.writeText(content)
}
