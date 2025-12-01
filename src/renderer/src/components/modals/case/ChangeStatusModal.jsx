/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { useCaseLogsApi } from '../../../hooks/useCaseLogsApi'

const OPTIONS = ['Open', 'Re-Open', 'Closed']

export default function ChangeStatusModal({
  open,
  onClose,
  caseId,
  currentStatus = 'Open',
  onChanged
}) {
  const { changeStatus } = useCaseLogsApi()

  const [sel, setSel] = useState(currentStatus)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setSel(currentStatus)
      setNotes('')
      setSubmitting(false)
      setError(null)
    }
  }, [open, currentStatus])

  // Allowed transitions
  const getAllowedOptions = (status) => {
    if (status === 'Open') return ['Closed']
    if (status === 'Re-Open') return ['Closed']
    if (status === 'Closed') return ['Re-Open']
    return []
  }

  const allowed = getAllowedOptions(currentStatus)

  const handleConfirm = async () => {
    if (!caseId) return
    setSubmitting(true)
    setError(null)
    try {
      await changeStatus(caseId, {
        status: sel,
        notes: notes.trim()
      })
      onChanged?.()
      onClose?.()
    } catch (err) {
      console.error('Failed to change status', err)
      setError(err?.message || 'Failed to change status')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Change Case Status"
      onCancel={onClose}
      confirmText={submitting ? 'Applying...' : 'Apply'}
      onConfirm={handleConfirm}
      disableConfirm={submitting || !sel || sel === currentStatus || !allowed.includes(sel)}
      size="md"
    >
      <div className="grid gap-3">
        <div className="text-sm font-semibold" style={{ color: 'var(--dim)' }}>
          Select status
        </div>

        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((o) => {
            const isAllowed = allowed.includes(o)
            return (
              <button
                key={o}
                type="button"
                onClick={() => isAllowed && setSel(o)}
                disabled={!isAllowed || submitting}
                className={[
                  'px-3 py-1.5 rounded-lg border text-sm transition',
                  sel === o ? 'bg-white/10' : 'hover:bg-white/10',
                  !isAllowed ? 'opacity-40 cursor-not-allowed' : ''
                ].join(' ')}
                style={{ borderColor: 'var(--border)' }}
              >
                {o}
              </button>
            )
          })}
        </div>

        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Notes
          </div>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write status change notes"
            className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
            style={{ borderColor: 'var(--border)' }}
            disabled={submitting}
          />
        </div>

        {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
      </div>
    </Modal>
  )
}
