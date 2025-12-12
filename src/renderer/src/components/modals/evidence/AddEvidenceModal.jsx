/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from '../Modal'
import FormLabel from '../../atoms/FormLabel'
import Radio from '../../atoms/Radio'
import Input from '../../atoms/Input'
import Textarea from '../../atoms/Textarea'
import Select from '../../atoms/Select'
import { useAuth } from '../../../store/auth'
import { validateSafeFileName, validateSafeID } from '../../../utils/safeTextValidators'
import truncateText from '../../../lib/truncateText'
import CaseSelect from '../../atoms/CaseSelect'

const DEVICE_SOURCES = ['Handphone', 'Ssd', 'HardDisk', 'Pc', 'Laptop', 'DVR']
const STATUS_OPTIONS = ['Witness', 'Reported', 'Suspected', 'Suspect', 'Defendant']

function mapDeviceSourceToApi(value) {
  switch (value) {
    case 'Handphone':
      return 'Handphone'
    case 'Ssd':
      return 'SSD'
    case 'HardDisk':
      return 'Harddisk'
    case 'Pc':
      return 'PC'
    case 'Laptop':
      return 'Laptop'
    case 'DVR':
      return 'DVR'
    default:
      return ''
  }
}
export default function AddEvidenceModal({
  open,
  onClose,
  onSave,
  caseOptions = [],
  defaultCaseId = '',
  defaultCaseName = '',
  defaultInvestigator = '',
  defaultPerson = null
}) {
  const { user } = useAuth()
  const [status, setStatus] = useState(null)
  const [caseId, setCaseId] = useState(defaultCaseId)
  const [idMode, setIdMode] = useState('gen')
  const [evidenceId, setEvidenceId] = useState('')
  const [source, setSource] = useState('')
  const [summary, setSummary] = useState('')
  const [investigator, setInvestigator] = useState(user.fullname)
  const [poiMode, setPoiMode] = useState(defaultPerson ? 'known' : 'unknown')
  const [personName, setPersonName] = useState(defaultPerson?.name || '')
  const [etype, setEtype] = useState('')
  const [file, setFile] = useState(null)
  const [previewDataUrl, setPreviewDataUrl] = useState(null)
  const [evidenceIdError, setEvidenceIdError] = useState('')
  const evidenceIdTooShort =
    idMode === 'manual' && evidenceId.trim().length > 0 && evidenceId.trim().length < 3

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fileRef = useRef(null)

  useEffect(() => {
    if (open) {
      setCaseId(defaultCaseId || '')
      setInvestigator(user.fullname || '')
      setPersonName(defaultPerson?.name || '')
      setPoiMode(defaultPerson ? 'known' : 'unknown')
      setStatus(defaultPerson?.status ?? null)
      setError(null)
      setSubmitting(false)
    } else {
      cleanup()
    }
  }, [open, defaultCaseId, defaultInvestigator, defaultPerson])

  function cleanup() {
    setFile(null)
    setPreviewDataUrl(null)
    setIdMode('gen')
    setEvidenceId('')
    setSource('')
    setSummary('')
    setEtype('')
    setError(null)
    setSubmitting(false)
  }

  function fileToDataURL(f) {
    return new Promise((res, rej) => {
      const fr = new FileReader()
      fr.onerror = rej
      fr.onload = () => res(String(fr.result))
      fr.readAsDataURL(f)
    })
  }

  async function onPickFile(e) {
    const f = e.target.files?.[0]
    setFile(f || null)
    setPreviewDataUrl(null)
    setError(null)
    if (f && f.type?.startsWith('image/')) {
      setPreviewDataUrl(await fileToDataURL(f))
    }
    e.target.value = ''
  }

  const hasCase = !!caseId
  const hasFile = !!file
  const hasInvestigator = investigator.trim().length > 0
  const isUnknown = poiMode === 'unknown'
  const hasPersonName = personName.trim().length > 0

  const canSubmit =
    hasCase && hasFile && hasInvestigator && (isUnknown || hasPersonName) && !submitting

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return

    setSubmitting(true)
    setError(null)

    // RESET ERROR
    setEvidenceIdError(null)

    if (idMode === 'manual') {
      if (evidenceIdTooShort) {
        setEvidenceIdError('Evidence ID must be at least 3 characters.')
        setSubmitting(false)
        return
      } else if (!evidenceId.trim()) {
        setEvidenceIdError('Evidence ID is required.')
        setSubmitting(false)
        return
      } else {
        const { ok, error } = validateSafeID(evidenceId, 'Evidence ID')
        if (!ok) {
          setEvidenceIdError(error)
          setSubmitting(false)
          return
        }
      }
    }

    try {
      const is_unknown_person = isUnknown

      let finalPersonName = null
      let finalStatus = null

      if (!is_unknown_person) {
        finalPersonName = defaultPerson?.name || personName.trim()
        finalStatus = defaultPerson?.status || status || null
      }

      let evidenceFilePayload = null
      if (file) {
        const buf = await file.arrayBuffer()
        evidenceFilePayload = {
          name: file.name,
          type: file.type,
          size: file.size,
          buffer: Array.from(new Uint8Array(buf))
        }
      }

      const mappedSource = mapDeviceSourceToApi(source) || undefined

      const payload = {
        case_id: Number(caseId),
        evidence_number: idMode === 'manual' && evidenceId.trim() ? evidenceId.trim() : undefined,
        type: etype || undefined,

        // ✅ amanin naming kontrak berbeda
        source: mappedSource,
        evidence_source: mappedSource,

        evidence_summary: summary.trim() || undefined,
        investigator: investigator.trim(),
        person_name: is_unknown_person ? null : finalPersonName,
        suspect_status: is_unknown_person ? null : finalStatus || null,
        is_unknown_person,
        evidence_file: evidenceFilePayload || undefined
      }

      const res = await window.api.invoke('evidence:create', payload)
      if (res?.error) throw new Error(res.message || 'Failed to create evidence')

      await onSave?.({
        apiResponse: res,
        caseId,
        caseName: defaultCaseName || caseOptions.find((c) => c.value === caseId)?.label,
        idMode,
        id: idMode === 'gen' ? undefined : evidenceId.trim(),
        source,
        summary: summary.trim(),
        investigator: investigator.trim(),
        personOfInterest: is_unknown_person ? null : finalPersonName,
        type: etype,
        fileName: file?.name,
        fileSize: file?.size,
        fileMime: file?.type,
        previewDataUrl,
        status: finalStatus
      })

      cleanup()
      onClose?.()
    } catch (err) {
      console.error('Failed to create evidence', err)
      setError(err?.message || 'Failed to create evidence')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Add Evidence"
      onCancel={() => {
        cleanup()
        onClose?.()
      }}
      confirmText={submitting ? 'Submitting…' : 'Submit'}
      disableConfirm={!canSubmit}
      onConfirm={handleSubmit}
      size="lg"
    >
      <div className="grid gap-3">
        <FormLabel>Case Related</FormLabel>
        {defaultCaseId ? (
          <Input value={defaultCaseName} disabled readOnly />
        ) : (
          <CaseSelect
            value={caseId}
            options={caseOptions}
            disabled={submitting}
            maxHeight={240}
            onChange={(val) => setCaseId(val)}
          />
        )}

        <FormLabel>Evidence ID Mode</FormLabel>
        <div className="flex items-center gap-6">
          <Radio checked={idMode === 'gen'} onChange={() => setIdMode('gen')} disabled={submitting}>
            Generating
          </Radio>
          <Radio
            checked={idMode === 'manual'}
            onChange={() => setIdMode('manual')}
            disabled={submitting}
          >
            Manual input
          </Radio>
        </div>

        {idMode === 'manual' && (
          <>
            <FormLabel>Evidence ID</FormLabel>
            <Input
              maxLength={50}
              value={evidenceId}
              onChange={(e) => {
                const v = e.target.value
                if (/^[A-Za-z0-9-]*$/.test(v)) {
                  setEvidenceId(v)
                  if (evidenceIdError || evidenceIdTooShort) {
                    if (v.trim().length > 0 && v.trim().length < 3) {
                      setEvidenceIdError('Evidence ID must be at least 3 characters.')
                    } else if (!v.trim()) {
                      setEvidenceIdError('Evidence ID is required.')
                    } else {
                      const { ok, error } = validateSafeID(v, 'Evidence ID')
                      setEvidenceIdError(ok ? '' : error)
                    }
                  }
                }
              }}
              placeholder="Input Evidence ID"
              disabled={submitting}
              error={
                evidenceIdError ||
                (evidenceIdTooShort && 'Evidence ID must be at least 3 characters.')
              }
            />
          </>
        )}

        <FormLabel>Evidence Source</FormLabel>
        <Select value={source} onChange={(e) => setSource(e.target.value)} disabled={submitting}>
          <option value="" disabled>
            Select device
          </option>
          {DEVICE_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <FormLabel>Evidence Image</FormLabel>
        <div
          className="rounded-lg border p-4 flex items-center justify-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-1.5 rounded-lg border text-sm bg-[#394F6F]"
              style={{ borderColor: 'var(--border)' }}
              onClick={() => fileRef.current?.click()}
              disabled={submitting}
            >
              Upload
            </button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".jpg, .jpeg, .png, .gif, .bmp, .webp"
              onChange={onPickFile}
            />
            {file && !previewDataUrl && (
              <span className="text-sm opacity-70 truncate max-w-60">{file.name}</span>
            )}
          </div>
        </div>

        {previewDataUrl && (
          <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
            <img
              src={previewDataUrl}
              alt="preview"
              className="max-h-56 rounded-lg object-contain mx-auto"
            />
          </div>
        )}

        <FormLabel>Evidence Summary</FormLabel>
        <Textarea
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Write evidence summary"
          disabled={submitting}
        />

        <FormLabel>Investigator</FormLabel>
        <Input
          value={investigator}
          onChange={(e) => setInvestigator(e.target.value)}
          placeholder="Input name"
          disabled={!!defaultInvestigator || submitting}
          readOnly
        />

        <FormLabel>
          <span className={`${defaultPerson ? 'opacity-70' : ''}`}>Person of Interest</span>
        </FormLabel>
        <div className={`flex items-center gap-6 ${defaultPerson ? 'opacity-70' : ''}`}>
          <Radio
            checked={poiMode === 'known'}
            onChange={() => {
              if (!defaultPerson) {
                setPoiMode('known')
                if (status === null) setStatus('')
              }
            }}
            disabled={submitting}
          >
            Person name
          </Radio>

          <Radio
            checked={poiMode === 'unknown'}
            onChange={() => {
              if (!defaultPerson) {
                setPoiMode('unknown')
                setStatus(null)
              }
            }}
            disabled={submitting}
          >
            Unknown
          </Radio>
        </div>

        {poiMode === 'known' && (
          <>
            <FormLabel>Person Name</FormLabel>
            <Input
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Name"
              disabled={!!defaultPerson || submitting}
              readOnly={!!defaultPerson}
            />

            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
                Suspect Status
              </div>
              <select
                className="w-full px-3 py-2 rounded-lg border bg-[#151d28]"
                style={{ borderColor: 'var(--border)' }}
                value={status || ''}
                disabled={defaultPerson?.status || submitting}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="" disabled>
                  Select Suspect Status
                </option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
      </div>
    </Modal>
  )
}
