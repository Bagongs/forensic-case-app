// eslint-disable-next-line react/prop-types
export default function Input({ maxLength = 180, ...props }) {
  return (
    <input
      {...props}
      maxLength={maxLength}
      className="w-full px-3 py-2 rounded-md border bg-transparent"
      style={{ borderColor: 'var(--border)' }}
    />
  )
}
