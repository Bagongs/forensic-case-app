/* eslint-disable react/prop-types */
export default function MiniButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="px-3 py-1.5 text-sm rounded-lg border hover:bg-white/10 transition"
      style={{ borderColor: 'var(--border)' }}
    >
      {children}
    </button>
  )
}
