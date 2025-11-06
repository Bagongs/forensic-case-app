/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/renderer/src/components/AddCaseModal.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import Modal from './Modal'

export default function AddCaseModal({
  open,
  onClose,
  onSave,
  agencies = ['Interpol', 'Imigrasi', 'KPK', 'POLRI'],
  workUnitsByAgency = {
    Interpol: ['HQ', 'Regional A'],
    Imigrasi: ['Bandara', 'Pelabuhan'],
    KPK: ['Direktorat A'],
    POLRI: ['Ditreskrimsus', 'Ditreskrimum']
  }
}) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [idMode, setIdMode] = useState('gen') // 'gen' | 'manual'
  const [manualId, setManualId] = useState('')
  const [investigator, setInvestigator] = useState('')
  const [agency, setAgency] = useState('')
  const [workUnit, setWorkUnit] = useState('')

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

  const unitOptions = useMemo(() => workUnitsByAgency[agency] || [], [agency, workUnitsByAgency])
  useEffect(() => {
    setWorkUnit('')
  }, [agency])

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
          agency,
          workUnit
        })
        onClose()
      }}
      disableConfirm={!canSubmit}
      size="lg"
    >
      <div className="grid gap-4">
        {/* Case name */}
        <FormLabel>Case name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="name" />

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
            Manual input
          </Radio>
        </div>
        {idMode === 'manual' && (
          <Input
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="Input case ID"
          />
        )}

        <hr className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />

        {/* Investigator */}
        <FormLabel>Main Investigator</FormLabel>
        <Input
          value={investigator}
          onChange={(e) => setInvestigator(e.target.value)}
          placeholder="input name"
        />

        {/* Agency + Work Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FormLabel>Agency</FormLabel>
            <Select value={agency} onChange={(e) => setAgency(e.target.value)}>
              <option value="" disabled>
                Select name
              </option>
              {agencies.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <FormLabel>Work Unit</FormLabel>
            <Select
              value={workUnit}
              onChange={(e) => setWorkUnit(e.target.value)}
              disabled={!unitOptions.length}
            >
              <option value="" disabled>
                Select name
              </option>
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </Modal>
  )
}

/* ——— helpers (mini UI atoms monokrom) ——— */
function FormLabel({ children }) {
  return (
    <div className="text-xs font-semibold" style={{ color: 'var(--dim)' }}>
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
function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 rounded-lg border bg-transparent"
      style={{ borderColor: 'var(--border)' }}
    >
      {children}
    </select>
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
