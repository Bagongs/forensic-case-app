/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import Modal from '../Modal'
import HorizontalLine from '../../common/HorizontalLine'
import { useAuth } from '../../../store/auth'
import { validateSafeHumanName, validateSafeFileName } from '../../../utils/safeTextValidators'

export default function EditCaseModal({ open, onClose, initial, onSave }) {
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [id, setId] = useState('')
  const [description, setDescription] = useState('')
  const [investigator, setInvestigator] = useState('')
  const [agency, setAgency] = useState('')
  const [workUnit, setWorkUnit] = useState('')

  // Error states
  const [nameError, setNameError] = useState('')
  const [investigatorError, setInvestigatorError] = useState('')
  const [agencyError, setAgencyError] = useState('')
  const [workUnitError, setWorkUnitError] = useState('')

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setDescription(initial?.description || '')
      setInvestigator(user.fullname || '')
      setId(initial?.id || '')
      setAgency(initial?.agency || '')
      setWorkUnit(initial?.workUnit || '')

      setNameError('')
      setInvestigatorError('')
      setAgencyError('')
      setWorkUnitError('')
    }
  }, [open, initial])

  const canSubmit = name.trim().length > 0 && !nameError && !agencyError && !workUnitError

  const handleSave = () => {
    // Reset errors
    setNameError('')
    setInvestigatorError('')
    setAgencyError('')
    setWorkUnitError('')

    let hasError = false

    // ========== CASE NAME (VALIDATED) ==========
    {
      const { ok, error } = validateSafeFileName(name, 'Case name')
      if (!ok) {
        setNameError(error)
        hasError = true
      }
    }

    // ========== INVESTIGATOR (OPTIONAL, SAFE) ==========
    if (investigator.trim()) {
      const { ok, error } = validateSafeHumanName(investigator, 'Main investigator')
      if (!ok) {
        setInvestigatorError(error)
        hasError = true
      }
    }

    // ========== AGENCY (OPTIONAL, SAFE) ==========
    if (agency.trim()) {
      const { ok, error } = validateSafeHumanName(agency, 'Agency')
      if (!ok) {
        setAgencyError(error)
        hasError = true
      }
    }

    // ========== WORK UNIT (OPTIONAL, SAFE) ==========
    if (workUnit.trim()) {
      const { ok, error } = validateSafeHumanName(workUnit, 'Work unit')
      if (!ok) {
        setWorkUnitError(error)
        hasError = true
      }
    }

    if (hasError) return

    onSave?.({
      title: name.trim(),
      description: description.trim(), // bebas, tanpa validator
      main_investigator: investigator.trim(),
      agency_name: agency.trim(),
      work_unit_name: workUnit.trim()
    })
  }

  return (
    <Modal
      open={open}
      title="Edit Case"
      onCancel={onClose}
      confirmText="Save changes"
      disableConfirm={!canSubmit}
      onConfirm={handleSave}
      size="lg"
    >
      <div className="grid gap-4">
        {/* Case Name */}
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Case name
          </div>
          <input
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
            className="w-full px-3 py-2 rounded-lg border bg-transparent"
            style={{ borderColor: nameError ? 'red' : 'var(--border)' }}
          />
          {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
        </div>

        {/* Description – bebas */}
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

        {/* Case ID (read-only) */}
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Case ID
          </div>
          <input
            value={id}
            disabled
            placeholder="case id"
            className="w-full px-3 py-2 rounded-lg border bg-transparent opacity-60"
            style={{ borderColor: 'var(--border)' }}
          />
        </div>

        <HorizontalLine color={'#394F6F'} />

        {/* Main Investigator */}
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Main Investigator
          </div>
          <input
            readOnly
            value={investigator}
            className="w-full px-3 py-2 rounded-lg border bg-transparent"
            style={{ borderColor: 'var(--border)' }}
          />
          {investigatorError && <p className="text-red-400 text-xs mt-1">{investigatorError}</p>}
        </div>

        <div className="flex flex-row gap-5">
          {/* Agency */}
          <div className="w-full">
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
              Agency
            </div>
            <input
              value={agency}
              onChange={(e) => {
                const v = e.target.value
                setAgency(v)
                if (agencyError) {
                  const { ok, error } = validateSafeHumanName(v, 'Agency')
                  setAgencyError(ok ? '' : error)
                }
              }}
              placeholder="Agency"
              className="w-full px-3 py-2 rounded-lg border bg-transparent"
              style={{ borderColor: agencyError ? 'red' : 'var(--border)' }}
            />
            {agencyError && <p className="text-red-400 text-xs mt-1">{agencyError}</p>}
          </div>

          {/* Work Unit */}
          <div className="w-full">
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
              Work Unit
            </div>
            <input
              value={workUnit}
              onChange={(e) => {
                const v = e.target.value
                setWorkUnit(v)
                if (workUnitError) {
                  const { ok, error } = validateSafeHumanName(v, 'Work unit')
                  setWorkUnitError(ok ? '' : error)
                }
              }}
              placeholder="Work Unit"
              className="w-full px-3 py-2 rounded-lg border bg-transparent"
              style={{ borderColor: workUnitError ? 'red' : 'var(--border)' }}
            />
            {workUnitError && <p className="text-red-400 text-xs mt-1">{workUnitError}</p>}
          </div>
        </div>
      </div>
    </Modal>
  )
}
