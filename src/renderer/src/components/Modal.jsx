// src/renderer/src/components/Modal.jsx
/* eslint-disable react/prop-types */
import { useEffect, useRef, useId } from 'react'
import clsx from 'clsx'

export default function Modal({
  open,
  title,
  children,
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Next',
  disableConfirm = false,
  size = 'md',
  footer,
  initialFocusSelector,
  closable = true,
  className
}) {
  const dialogRef = useRef(null)
  const didFocusRef = useRef(false)
  const titleId = useId()

  // Focus handler
  useEffect(() => {
    if (!open) {
      didFocusRef.current = false
      return
    }
    if (didFocusRef.current) return
    if (initialFocusSelector) {
      const el = dialogRef.current?.querySelector(initialFocusSelector)
      if (el) {
        el.focus()
        didFocusRef.current = true
        return
      }
    }
    const active = document.activeElement
    if (dialogRef.current?.contains(active)) {
      didFocusRef.current = true
      return
    }
    const first = dialogRef.current?.querySelector(
      'input,select,textarea,button,[tabindex]:not([tabindex="-1"])'
    )
    first?.focus()
    didFocusRef.current = true
  }, [open, initialFocusSelector])

  // Escape key + body scroll lock
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onCancel?.()
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onCancel])

  if (!open) return null

  const width =
    size === 'sm'
      ? 'w-[420px]'
      : size === 'md'
        ? 'w-[560px]'
        : size === 'lg'
          ? 'w-[720px]'
          : size === 'xl'
            ? 'w-[900px]'
            : 'w-[560px]'

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div
        ref={dialogRef}
        className={clsx('relative rounded-[14px] overflow-visible shadow-xl', width, className)}
        style={{ background: '#151D28' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ background: '#2A3A51', borderBottom: '2px solid var(--dim)' }}
        >
          {title ? (
            <h2 id={titleId} className="app-title text-[18px]">
              {title}
            </h2>
          ) : (
            <div />
          )}
          {closable && (
            <button
              onClick={onCancel}
              aria-label="Close"
              className="text-white/80 hover:text-white text-[20px] leading-none"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-6 max-h-[70vh] overflow-auto">{children}</div>

        {footer !== undefined ? (
          <div className="px-6 pb-5">{footer}</div>
        ) : (
          <div
            className={`px-6 pb-5 flex ${confirmText != 'Delete' ? 'justify-end' : 'justify-center'}  gap-3 `}
          >
            <button
              type="button"
              onClick={onCancel}
              className="px-5 h-10 text-sm rounded-sm"
              style={{
                background: 'transparent',
                border: confirmText != 'Delete' ? '1.5px solid #EDC702' : '1.5px solid #7D7D7D',
                color: '#E7E9EE'
              }}
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                disabled={disableConfirm}
                className="px-5 h-10 text-sm rounded-sm disabled:opacity-60"
                style={{
                  background:
                    confirmText != 'Delete'
                      ? 'radial-gradient(circle, #EDC702 0%, #B89E02 100%)'
                      : 'radial-gradient(circle, #B10202 0%, #B10101B2 100%)',
                  color: confirmText != 'Delete' ? '#0C0C0C' : '#F4F6F8',
                  border: confirmText != 'Delete' ? '1px solid #EDC702B2' : '0.7px solid #B10202B2'
                }}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
