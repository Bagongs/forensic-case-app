import { useEffect, useRef, useState } from 'react'
import truncateText from '../../lib/truncateText'

export default function CaseSelect({
  value,
  options,
  placeholder = 'Select Case',
  disabled,
  onChange,
  maxHeight = 240
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selected = options.find((o) => String(o.value) === String(value))

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2 rounded-lg border text-left bg-[#151d28]"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className={selected ? '' : 'text-gray-400'}>
          {selected ? truncateText(selected.label, 65) : placeholder}
        </span>
      </button>

      {/* Dropdown */}
      {open && !disabled && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg border bg-[#151d28] shadow-lg overflow-y-auto custom-scroll"
          style={{ maxHeight, borderColor: 'var(--border)' }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              title={opt.label}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={`px-3 py-2 text-sm cursor-pointer
                ${String(opt.value) === String(value) ? 'bg-[#394F6F]' : 'hover:bg-[#1e293b]'}`}
            >
              {truncateText(opt.label, 65)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
