// src/renderer/src/components/ChangeStatusModal.jsx
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import Modal from './Modal'
import { useCases } from '../store/cases'

const OPTIONS = ['Open', 'Re-Open', 'Closed']

export default function ChangeStatusModal({
  open,
  onClose,
  caseId,
  currentStatus = 'Open',
  author = '' // opsional: isi investigator / user login
}) {
  const setCaseStatus = useCases((s) => s.setCaseStatus)
  const [sel, setSel] = useState(currentStatus)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) {
      setSel(currentStatus)
      setNotes('')
    }
  }, [open, currentStatus])

  return (
    <Modal
      open={open}
      title="Change Case Status"
      onCancel={onClose}
      confirmText="Apply"
      onConfirm={() => {
        setCaseStatus(caseId, sel, notes, author)
        onClose?.()
      }}
      size="md"
    >
      <div className="grid gap-3">
        <div className="text-sm font-semibold" style={{ color: 'var(--dim)' }}>
          Select status
        </div>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setSel(o)}
              className={[
                'px-3 py-1.5 rounded-lg border text-sm transition',
                sel === o ? 'bg-white/10' : 'hover:bg-white/10'
              ].join(' ')}
              style={{ borderColor: 'var(--border)' }}
            >
              {o}
            </button>
          ))}
        </div>

        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Notes (optional)
          </div>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write status change notes"
            className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
            style={{ borderColor: 'var(--border)' }}
          />
        </div>
      </div>
    </Modal>
  )
}
