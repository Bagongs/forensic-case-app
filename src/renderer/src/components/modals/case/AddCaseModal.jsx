/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import Modal from '../Modal'
import HorizontalLine from '../../common/HorizontalLine'
import FormLabel from '../../atoms/FormLabel'
import Radio from '../../atoms/Radio'
import Input from '../../atoms/Input'
import Textarea from '../../atoms/Textarea'

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

  const manualIdTooShort =
    idMode === 'manual' && manualId.trim().length > 0 && manualId.trim().length < 3

  const canSubmit =
    name.trim() &&
    (idMode === 'gen' || (manualId.trim() && manualId.trim().length >= 3)) &&
    !manualIdTooShort

  const handleConfirm = () => {
    if (!canSubmit) return

    const payload = {
      title: name.trim(),
      description: desc.trim(),
      main_investigator: investigator.trim(),
      agency_name: agency.trim(),
      work_unit_name: workUnit.trim()
    }

    if (idMode === 'manual' && manualId.trim()) {
      payload.case_number = manualId.trim()
    }

    onSave(payload)
  }

  return (
    <Modal
      open={open}
      title="Add case"
      onCancel={onClose}
      confirmText="Add case"
      onConfirm={handleConfirm}
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
          <div className="flex flex-col gap-1">
            <Input
              value={manualId}
              onChange={(e) => {
                const v = e.target.value
                if (/^[A-Za-z0-9-]*$/.test(v)) {
                  setManualId(v)
                }
              }}
              placeholder="Input Case ID"
            />
            {manualIdTooShort && (
              <p className="text-red-400 text-xs">Case ID must be at least 3 characters</p>
            )}
          </div>
        )}

        <HorizontalLine color={'var(--border)'} />

        <FormLabel>Main Investigator</FormLabel>
        <Input
          value={investigator}
          onChange={(e) => setInvestigator(e.target.value)}
          placeholder="Input Name"
        />

        {/* Agency + Work Unit */}
        <div className="flex flex-row gap-5 w-full">
          <div className="w-full space-y-2">
            <FormLabel>Agency</FormLabel>
            <Input
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              placeholder="Input agency"
            />
          </div>

          <div className="w-full space-y-2">
            <FormLabel>Work Unit</FormLabel>
            <Input
              value={workUnit}
              onChange={(e) => setWorkUnit(e.target.value)}
              placeholder="Input Work Unit"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
