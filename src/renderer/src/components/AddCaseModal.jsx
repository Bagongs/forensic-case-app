/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/renderer/src/components/AddCaseModal.jsx
import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'
import HorizontalLine from './common/HorizontalLine'

export default function AddCaseModal({ open, onClose, onSave }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [idMode, setIdMode] = useState('gen') // 'gen' | 'manual'
  const [manualId, setManualId] = useState('')
  const [investigator, setInvestigator] = useState('')
  const [agency, setAgency] = useState('')
  const [workUnit, setWorkUnit] = useState('')

  // Reset form setiap kali modal ditutup
  useEffect(() => {
    if (!open) {
      setName('')
      setDesc('')
      setIdMode('gen')
      setManualId('')
      setInvestigator('')
      setAgency('')
      setWorkUnit('')
    }
  }, [open])

  const canSubmit = name.trim() && (idMode === 'gen' || manualId.trim())

  return (
    <Modal
      open={open}
      title="Add case"
      onCancel={onClose}
      confirmText="Add case"
      onConfirm={() => {
        onSave({
          name: name.trim(),
          description: desc.trim(),
          id: idMode === 'gen' ? undefined : manualId.trim(),
          idMode,
          investigator: investigator.trim(),
          agency: agency.trim(),
          workUnit: workUnit.trim()
        })
        onClose()
      }}
      disableConfirm={!canSubmit}
      size="lg"
    >
      <div className="grid gap-3">
        {/* Case name */}
        <FormLabel>Case name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />

        {/* Description */}
        <FormLabel>Case Description</FormLabel>
        <Textarea
          rows={5}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Case Description"
        />

        {/* Case ID */}
        <FormLabel>Case ID</FormLabel>
        <div className="flex items-center gap-6">
          <Radio checked={idMode === 'gen'} onChange={() => setIdMode('gen')}>
            Generating
          </Radio>
          <Radio checked={idMode === 'manual'} onChange={() => setIdMode('manual')}>
            Manual Input
          </Radio>
        </div>
        {idMode === 'manual' && (
          <Input
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="Input Case ID "
          />
        )}

        <HorizontalLine color={'var(--border)'} />

        <FormLabel>Main Investigator</FormLabel>
        <Input
          value={investigator}
          onChange={(e) => setInvestigator(e.target.value)}
          placeholder="Input Name"
        />

        {/* Agency */}
        <div className="flex flex-row gap-5 w-full">
          <div className="w-full space-y-2">
            <FormLabel>Agency</FormLabel>
            <Input
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              placeholder="Input agency "
            />
          </div>

          {/* Work Unit */}
          <div className="w-full space-y-2">
            <FormLabel>Work Unit</FormLabel>
            <Input
              value={workUnit}
              onChange={(e) => setWorkUnit(e.target.value)}
              placeholder="Input Work Unit "
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

/* ——— helpers (mini UI atoms monokrom) ——— */
function FormLabel({ children }) {
  return (
    <div className="text-sm font-semibold" style={{ color: 'var(--dim)' }}>
      {children}
    </div>
  )
}
function Input(props) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 rounded-lg border bg-transparent"
      style={{ borderColor: 'var(--border)' }}
    />
  )
}
function Textarea(props) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 rounded-lg border bg-transparent"
      style={{ borderColor: 'var(--border)' }}
    />
  )
}
function Radio({ checked, onChange, children }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input type="radio" className="accent-indigo-400" checked={checked} onChange={onChange} />
      {children}
    </label>
  )
}
