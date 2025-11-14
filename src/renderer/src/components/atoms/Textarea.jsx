export default function Textarea(props) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
      style={{ borderColor: 'var(--border)' }}
    />
  )
}
