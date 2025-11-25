export default function Select(props) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 rounded-lg border bg-[#151d28]"
      style={{ borderColor: 'var(--border)' }}
    />
  )
}
