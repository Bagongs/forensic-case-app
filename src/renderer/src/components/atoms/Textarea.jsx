// eslint-disable-next-line react/prop-types
export default function Textarea({ error, className = '', style, ...props }) {
  const hasError = !!error

  return (
    <div className="w-full">
      <textarea
        {...props}
        className={`w-full px-3 py-2 rounded-lg border bg-transparent resize-none ${className}`}
        style={{
          borderColor: hasError ? '#f87171' : 'var(--border)',
          ...(style || {})
        }}
      />
      {hasError && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
