export default function truncateText(text, max = 20) {
  if (!text) return '-'
  return text.length > max ? text.substring(0, max) + '...' : text
}
