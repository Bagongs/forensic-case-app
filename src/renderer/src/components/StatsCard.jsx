/* eslint-disable react/prop-types */
export default function StatsCard({ value, label, bg, style = {} }) {
  return (
    <div
      className={`flex w-[428px] h-[120px] items-center px-4 bg-cover bg-left bg-no-repeat ${style}`}
      style={{
        borderColor: 'var(--border)',
        backgroundImage: bg ? `url(${bg})` : 'none',
        backgroundSize: '280px',
        ...style
      }}
    >
      {/* Value + Label */}
      <div className="flex flex-col text-left ml-[100px]">
        <div className="text-3xl font-bold text-[#FFD84C] leading-none">{value}</div>
        <div className="text-sm mt-1 tracking-wide text-white/90">{label}</div>
      </div>
    </div>
  )
}
