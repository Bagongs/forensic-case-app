export default function Select(props) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 rounded-lg border bg-[#151d28] max-h-40 overflow-y-auto"
      style={{ borderColor: 'var(--border)' }}
    />
  )
}
