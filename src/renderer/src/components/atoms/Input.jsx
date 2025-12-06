// eslint-disable-next-line react/prop-types
export default function Input({ maxLength = 180, error, className = '', style, ...props }) {
  const hasError = !!error

  return (
    <div className="w-full">
      <input
        {...props}
        maxLength={maxLength}
        className={`w-full px-3 py-2 rounded-md border bg-transparent ${className}`}
        style={{
          borderColor: hasError ? '#f87171' : 'var(--border)',
          ...(style || {})
        }}
      />
      {hasError && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
