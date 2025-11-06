/* eslint-disable react/prop-types */
export default function StatsCard({ value, label }) {
  return (
    <div className="rounded-xl border p-6 text-center" style={{ borderColor: 'var(--border)' }}>
      <div className="text-4xl font-bold">{value}</div>
      <div className="text-xs mt-2 opacity-70">{label}</div>
    </div>
  )
}
