// src/renderer/src/components/EditCaseModal.jsx
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import Modal from './Modal'
import HorizontalLine from './common/HorizontalLine'

export default function EditCaseModal({ open, onClose, initial, onSave }) {
  const [name, setName] = useState(initial?.name || '')
  const [id, setId] = useState(initial?.id || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [investigator, setInvestigator] = useState(initial?.investigator || '')
  const [agency, setAgency] = useState(initial?.agency || '')
  const [workUnit, setWorkUnit] = useState(initial?.workUnit || '')

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setDescription(initial?.description || '')
      setInvestigator(initial?.investigator || '')
      setId(initial?.id || '')
      setAgency(initial?.agency || '')
      setWorkUnit(initial?.workUnit || '')
    }
  }, [open, initial])

  const canSubmit = name.trim().length > 0

  return (
    <Modal
      open={open}
      title="Edit Case"
      onCancel={onClose}
      confirmText="Save changes"
      disableConfirm={!canSubmit}
      onConfirm={() => {
        onSave({
          name: name.trim(),
          description: description.trim(),
          investigator: investigator.trim()
        })
      }}
      size="lg"
    >
      <div className="grid gap-4">
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Case name
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
            className="w-full px-3 py-2 rounded-lg border bg-transparent"
            style={{ borderColor: 'var(--border)' }}
          />
        </div>

        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Case description
          </div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Case Description"
            className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
            style={{ borderColor: 'var(--border)' }}
          />
        </div>
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Case ID
          </div>
          <input
            value={id}
            disabled
            placeholder="case id"
            className="w-full px-3 py-2 rounded-lg border bg-transparent"
            style={{ borderColor: 'var(--border)' }}
          />
        </div>
        <HorizontalLine color={'#394F6F'} />
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Main Investigator
          </div>
          <input
            value={investigator}
            onChange={(e) => setInvestigator(e.target.value)}
            placeholder="input name"
            className="w-full px-3 py-2 rounded-lg border bg-transparent"
            style={{ borderColor: 'var(--border)' }}
          />
        </div>
        <div className="flex flex-row gap-5">
          <div className="w-full">
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
              Agency
            </div>
            <input
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              placeholder="Agency"
              className="w-full px-3 py-2 rounded-lg border bg-transparent"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>
          <div className="w-full">
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
              Work Unit
            </div>
            <input
              value={workUnit}
              onChange={(e) => setWorkUnit(e.target.value)}
              placeholder="Work Unit"
              className="w-full px-3 py-2 rounded-lg border bg-transparent"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
