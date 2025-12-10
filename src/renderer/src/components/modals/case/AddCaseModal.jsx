/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import Modal from '../Modal'
import HorizontalLine from '../../common/HorizontalLine'
import FormLabel from '../../atoms/FormLabel'
import Radio from '../../atoms/Radio'
import Input from '../../atoms/Input'
import Textarea from '../../atoms/Textarea'

import { validateSafeHumanName, validateSafeFileName, validateSafeID } from '../../../utils/safeTextValidators'

export default function AddCaseModal({ open, onClose, onSave }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [idMode, setIdMode] = useState('gen')
  const [manualId, setManualId] = useState('')
  const [investigator, setInvestigator] = useState('')
  const [agency, setAgency] = useState('')
  const [workUnit, setWorkUnit] = useState('')

  // error per field (TANPA description)
  const [nameError, setNameError] = useState('')
  const [manualIdError, setManualIdError] = useState('')
  const [investigatorError, setInvestigatorError] = useState('')
  const [agencyError, setAgencyError] = useState('')
  const [workUnitError, setWorkUnitError] = useState('')

  useEffect(() => {
    if (!open) {
      setName('')
      setDesc('')
      setIdMode('gen')
      setManualId('')
      setInvestigator('')
      setAgency('')
      setWorkUnit('')

      setNameError('')
      setManualIdError('')
      setInvestigatorError('')
      setAgencyError('')
      setWorkUnitError('')
    }
  }, [open])

  const manualIdTooShort =
    idMode === 'manual' && manualId.trim().length > 0 && manualId.trim().length < 3

  const canSubmitBasic = name.trim().length > 0

  const handleConfirm = () => {
    // reset error
    setNameError('')
    setManualIdError('')
    setInvestigatorError('')
    setAgencyError('')
    setWorkUnitError('')

    let hasError = false

    // ===== Case name (wajib, pakai safeTextValidators) =====
    {
      const { ok, error } = validateSafeFileName(name, 'Case name')
      if (!ok) {
        setNameError(error)
        hasError = true
      }
    }

    // ===== Description: BEBAS (tidak pakai safeTextValidators) =====
    // kalau mau batasi panjang, bisa cek di sini:
    // if (desc && desc.length > 5000) { ... }

    // ===== Investigator / Agency / Work Unit (opsional, tapi safe) =====
    if (investigator.trim()) {
      const { ok, error } = validateSafeHumanName(investigator, 'Main investigator')
      if (!ok) {
        setInvestigatorError(error)
        hasError = true
      }
    }

    if (agency.trim()) {
      const { ok, error } = validateSafeHumanName(agency, 'Agency')
      if (!ok) {
        setAgencyError(error)
        hasError = true
      }
    }

    if (workUnit.trim()) {
      const { ok, error } = validateSafeHumanName(workUnit, 'Work unit')
      if (!ok) {
        setWorkUnitError(error)
        hasError = true
      }
    }

    // ===== Case ID manual =====
    if (idMode === 'manual') {
      if (manualIdTooShort) {
        setManualIdError('Case ID must be at least 3 characters.')
        hasError = true
      } else if (!manualId.trim()) {
        setManualIdError('Case ID is required.')
        hasError = true
      } else {
        const { ok, error } = validateSafeID(manualId, 'Case ID')
        if (!ok) {
          setManualIdError(error)
          hasError = true
        }
      }
    }

    if (hasError) return

    const payload = {
      title: name.trim(),
      // desc langsung dipakai apa adanya (cuma di-trim)
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
      disableConfirm={!canSubmitBasic}
      size="lg"
    >
      <div className="grid gap-3">
        {/* Case name */}
        <FormLabel>Case name</FormLabel>
        <Input
          value={name}
          onChange={(e) => {
            const v = e.target.value
            setName(v)
            if (nameError) {
              const { ok, error } = validateSafeFileName(v, 'Case name')
              setNameError(ok ? '' : error)
            }
          }}
          placeholder="Name"
          error={nameError}
        />

        {/* Case Description — BEBAS, TANPA safeTextValidators */}
        <FormLabel>Case Description</FormLabel>
        <Textarea
          rows={5}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Case Description (free text, allowed to contain any characters / SQL words)"
          // TIDAK ada prop error di sini
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
            maxLength={50}
            value={manualId}
            onChange={(e) => {
              const v = e.target.value
              if (/^[A-Za-z0-9-]*$/.test(v)) {
                setManualId(v)
                if (manualIdError || manualIdTooShort) {
                  if (v.trim().length > 0 && v.trim().length < 3) {
                    setManualIdError('Case ID must be at least 3 characters.')
                  } else if (!v.trim()) {
                    setManualIdError('Case ID is required.')
                  } else {
                    const { ok, error } = validateSafeID(v, 'Case ID')
                    setManualIdError(ok ? '' : error)
                  }
                }
              }
            }}
            placeholder="Input Case ID"
            error={manualIdError || (manualIdTooShort && 'Case ID must be at least 3 characters')}
          />
        )}

        <HorizontalLine color={'var(--border)'} />

        {/* Main Investigator */}
        <FormLabel>Main Investigator</FormLabel>
        <Input
          value={investigator}
          onChange={(e) => {
            const v = e.target.value
            setInvestigator(v)
            if (investigatorError) {
              if (!v.trim()) {
                setInvestigatorError('')
              } else {
                const { ok, error } = validateSafeHumanName(v, 'Main investigator')
                setInvestigatorError(ok ? '' : error)
              }
            }
          }}
          placeholder="Input Name"
          error={investigatorError}
        />

        {/* Agency + Work Unit */}
        <div className="flex flex-row gap-5 w-full">
          <div className="w-full space-y-2">
            <FormLabel>Agency</FormLabel>
            <Input
              value={agency}
              onChange={(e) => {
                const v = e.target.value
                setAgency(v)
                if (agencyError) {
                  if (!v.trim()) {
                    setAgencyError('')
                  } else {
                    const { ok, error } = validateSafeHumanName(v, 'Agency')
                    setAgencyError(ok ? '' : error)
                  }
                }
              }}
              placeholder="Input agency"
              error={agencyError}
            />
          </div>

          <div className="w-full space-y-2">
            <FormLabel>Work Unit</FormLabel>
            <Input
              value={workUnit}
              onChange={(e) => {
                const v = e.target.value
                setWorkUnit(v)
                if (workUnitError) {
                  if (!v.trim()) {
                    setWorkUnitError('')
                  } else {
                    const { ok, error } = validateSafeHumanName(v, 'Work unit')
                    setWorkUnitError(ok ? '' : error)
                  }
                }
              }}
              placeholder="Input Work Unit"
              error={workUnitError}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
