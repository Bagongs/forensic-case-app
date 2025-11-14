/* eslint-disable react/prop-types */
import { useEffect, useRef, useId, useState } from 'react'
import clsx from 'clsx'
import UnsavedChangesModal from './UnsavedChangesModal'
import IncompleteFormModal from './IncompleteFormModal'

// 🔐 Global counter untuk scroll-lock
let openModalCount = 0
let bodyOverflowBeforeLock = ''

export default function Modal({
  open,
  title,
  header,
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

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [initialFormSnapshot, setInitialFormSnapshot] = useState(null)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [showIncompleteModal, setShowIncompleteModal] = useState(false)

  /* ===== Focus ===== */
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

  /* ===== Save initial snapshot ===== */
  useEffect(() => {
    if (open && dialogRef.current) {
      const formValues = collectFormValues(dialogRef.current)
      setInitialFormSnapshot(formValues)
      setHasUnsavedChanges(false)
    }
  }, [open])

  /* ===== Detect form changes ===== */
  useEffect(() => {
    if (!open || !dialogRef.current) return

    const handler = () => {
      const current = collectFormValues(dialogRef.current)
      setHasUnsavedChanges(
        initialFormSnapshot && JSON.stringify(current) !== JSON.stringify(initialFormSnapshot)
      )
    }

    dialogRef.current.addEventListener('input', handler)
    dialogRef.current.addEventListener('change', handler)
    return () => {
      dialogRef.current?.removeEventListener('input', handler)
      dialogRef.current?.removeEventListener('change', handler)
    }
  }, [open, initialFormSnapshot])

  /* ===== Escape key + scroll lock ===== */
  useEffect(() => {
    if (!open) return

    const onKey = (e) => {
      if (e.key === 'Escape' && closable) handleCancel()
    }

    document.addEventListener('keydown', onKey)
    openModalCount += 1
    if (openModalCount === 1) {
      bodyOverflowBeforeLock = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', onKey)
      openModalCount -= 1
      if (openModalCount <= 0) {
        document.body.style.overflow = bodyOverflowBeforeLock
        openModalCount = 0
      }
    }
  }, [open])

  /* ===== Cancel handler ===== */
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true)
      return
    }
    onCancel?.()
  }

  /* ===== Confirm handler (check requireds) ===== */
  const handleConfirm = () => {
    if (!dialogRef.current) {
      onConfirm?.()
      return
    }

    const allFields = dialogRef.current.querySelectorAll('input, textarea, select')

    const emptyRequired = Array.from(allFields).filter((el) => {
      // Skip optional
      if (el.dataset.optional === 'true') return false
      // Skip hidden or display:none
      if (el.offsetParent === null) return false
      // Skip checkbox / radio / file / hidden input
      if (['checkbox', 'radio', 'file', 'hidden'].includes(el.type)) return false

      // Check empty value
      return !el.value?.trim()
    })

    if (emptyRequired.length > 0) {
      setShowIncompleteModal(true)
      return
    }

    onConfirm?.()
  }

  /* ===== Modal Handlers ===== */
  const handleLeaveAnyway = () => {
    setShowUnsavedModal(false)
    onCancel?.()
  }

  const handleStay = () => {
    setShowUnsavedModal(false)
  }

  const handleCloseIncomplete = () => {
    setShowIncompleteModal(false)
  }

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
    <>
      {/* Main Modal */}
      <div
        className="fixed inset-0 z-50 grid place-items-center p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closable ? handleCancel : undefined}
        />

        {/* Dialog */}
        <div
          ref={dialogRef}
          className={clsx(
            'relative rounded-[14px] overflow-visible shadow-xl transition-all',
            width,
            className
          )}
          style={{ background: '#151D28' }}
        >
          {/* Header */}

          {header ? (
            <div className="flex items-center justify-center relative">
              {header}
              {closable && (
                <div className="absolute right-8 top-5">
                  <button
                    onClick={handleCancel}
                    aria-label="Close"
                    className="text-white/80 hover:text-white text-[20px] leading-none"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ background: '#2A3A51', borderBottom: '2px solid var(--dim-yellow)' }}
            >
              {title && (
                <h2 id={titleId} className="app-title text-[18px]">
                  {title}
                </h2>
              )}

              {closable && (
                <button
                  onClick={handleCancel}
                  aria-label="Close"
                  className="text-white/80 hover:text-white text-[20px] leading-none"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-6 max-h-[70vh] overflow-auto">{children}</div>

          {/* Footer */}
          {footer !== undefined ? (
            <div className="px-6 pb-5">{footer}</div>
          ) : (
            <div
              className={`px-6 pb-5 flex ${
                confirmText !== 'Delete' ? 'justify-end' : 'justify-center'
              } gap-3`}
            >
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 h-10 text-sm rounded-sm"
                style={{
                  background: 'transparent',
                  border: confirmText !== 'Delete' ? '1.5px solid #EDC702' : '1.5px solid #7D7D7D',
                  color: '#E7E9EE'
                }}
              >
                {cancelText}
              </button>

              {onConfirm && (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={disableConfirm}
                  className="px-5 h-10 text-sm rounded-sm disabled:opacity-60"
                  style={{
                    background:
                      confirmText !== 'Delete'
                        ? 'radial-gradient(circle, #EDC702 0%, #B89E02 100%)'
                        : 'radial-gradient(circle, #B10202 0%, #B10101B2 100%)',
                    color: confirmText !== 'Delete' ? '#0C0C0C' : '#F4F6F8',
                    border:
                      confirmText !== 'Delete' ? '3px solid #EDC702B2' : '0.7px solid #B10202B2'
                  }}
                >
                  {confirmText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        open={showUnsavedModal}
        onLeave={handleLeaveAnyway}
        onStay={handleStay}
      />

      {/* Incomplete Form Modal */}
      <IncompleteFormModal open={showIncompleteModal} onClose={handleCloseIncomplete} />
    </>
  )
}

/* Helper */
function collectFormValues(root) {
  const values = {}
  const elements = root.querySelectorAll('input, textarea, select')
  elements.forEach((el) => {
    if (el.type === 'checkbox' || el.type === 'radio') {
      values[el.name || el.id || el.dataset.key || el.outerHTML] = el.checked
    } else {
      values[el.name || el.id || el.dataset.key || el.outerHTML] = el.value
    }
  })
  return values
}
