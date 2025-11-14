export default function Input(props) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 rounded-md border bg-transparent"
      style={{ borderColor: 'var(--border)' }}
    />
  )
}
