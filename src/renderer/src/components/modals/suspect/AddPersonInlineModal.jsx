/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from '../Modal'
import { useCases } from '../../../store/cases'
import { usePersons } from '../../../store/persons'
import FormLabel from '../../atoms/FormLabel'
import Radio from '../../atoms/Radio'
import Input from '../../atoms/Input'
import Textarea from '../../atoms/Textarea'
import Select from '../../atoms/Select'

const DEVICE_SOURCES = ['Hp', 'Ssd', 'HardDisk', 'Pc', 'Laptop', 'DVR']
const STATUS_OPTIONS = ['Witness', 'Reported', 'Suspected', 'Suspect', 'Defendant']

function mapDeviceSourceToApi(value) {
  switch (value) {
    case 'Hp':
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
      return undefined
  }
}

export default function AddPersonInlineModal({ caseId, open, onClose }) {
  const fetchCaseDetail = useCases((s) => s.fetchCaseDetail)
  const fetchCaseLogs = useCases((s) => s.fetchCaseLogs)

  const createPersonRemote = usePersons((s) => s.createPersonRemote)

  const [mode, setMode] = useState('known') // known | unknown
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [evIdMode, setEvIdMode] = useState('gen')
  const [evId, setEvId] = useState('')
  const [source, setSource] = useState('')
  const [summary, setSummary] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fileRef = useRef(null)

  useEffect(() => {
    if (!open) reset()
  }, [open])

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setMode('known')
    setName('')
    setStatus('')
    setEvIdMode('gen')
    setEvId('')
    setSource('')
    setSummary('')
    setFile(null)
    setPreviewUrl(null)
    setSubmitting(false)
    setError(null)
  }

  async function onPickFile(e) {
    const f = e.target.files?.[0] || null
    setFile(f)

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)

    if (!f) {
      e.target.value = ''
      return
    }

    if (f.type?.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviewUrl(ev.target.result)
      reader.readAsDataURL(f)
    }

    e.target.value = ''
  }

  const isUnknown = mode === 'unknown'
  const hasName = name.trim().length > 0
  const hasStatus = !!status
  const hasManualEvidence = evIdMode === 'manual' && evId.trim().length > 0
  const hasFile = !!file
  const hasEvidence = hasManualEvidence || hasFile

  // ✅ sesuai contract: case_id + (unknown || (name+status)) + (file atau evidence_number)
  const canSubmit = !!caseId && (isUnknown || (hasName && hasStatus)) && hasEvidence && !submitting

  const handleSubmit = async () => {
    if (!canSubmit || submitting || !caseId) return

    setSubmitting(true)
    setError(null)

    try {
      let evidenceFilePayload
      if (file) {
        const buf = await file.arrayBuffer()
        evidenceFilePayload = {
          name: file.name,
          type: file.type,
          size: file.size,
          buffer: Array.from(new Uint8Array(buf))
        }
      }

      const payload = {
        case_id: Number(caseId),
        is_unknown_person: isUnknown,
        person_name: isUnknown ? undefined : name.trim(),
        suspect_status: isUnknown ? undefined : status, // wajib kalau known
        evidence_number: hasManualEvidence ? evId.trim() : undefined,
        evidence_source: mapDeviceSourceToApi(source),
        evidence_summary: summary.trim() || undefined,
        evidence_file: evidenceFilePayload
      }

      // ✅ PENTING: jangan kirim argumen kedua (hindari field liar ke backend)
      const res = await createPersonRemote(payload)

      if (res?.error) {
        throw new Error(res.message || 'Failed to create person')
      }

      // ✅ full refresh setelah sukses
      await fetchCaseDetail(caseId)
      await fetchCaseLogs(caseId, { skip: 0, limit: 50 })

      reset()
      onClose?.()
    } catch (err) {
      console.error('Failed to create person', err)
      setError(err?.message || 'Failed to create person')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Add Person of Interest"
      onCancel={() => {
        reset()
        onClose?.()
      }}
      confirmText={submitting ? 'Submitting…' : 'Submit'}
      disableConfirm={!canSubmit}
      onConfirm={handleSubmit}
      size="lg"
    >
      <div className="grid gap-3">
        <FormLabel>Person of Interest</FormLabel>
        <div className="flex items-center gap-6">
          <Radio
            checked={mode === 'known'}
            onChange={() => {
              setMode('known')
              setStatus('')
            }}
            disabled={submitting}
          >
            Person name
          </Radio>
          <Radio
            checked={mode === 'unknown'}
            onChange={() => {
              setMode('unknown')
              setStatus('')
            }}
            disabled={submitting}
          >
            Unknown Person
          </Radio>
        </div>

        {mode === 'known' && (
          <>
            <FormLabel>Person Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              disabled={submitting}
            />

            <FormLabel>Status</FormLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={submitting}
            >
              <option value="" disabled>
                Select Suspect Status
              </option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </>
        )}

        <FormLabel>Evidence ID Mode</FormLabel>
        <div className="flex items-center gap-6">
          <Radio
            checked={evIdMode === 'gen'}
            onChange={() => setEvIdMode('gen')}
            disabled={submitting}
          >
            Generating
          </Radio>
          <Radio
            checked={evIdMode === 'manual'}
            onChange={() => setEvIdMode('manual')}
            disabled={submitting}
          >
            Manual input
          </Radio>
        </div>

        {evIdMode === 'manual' && (
          <>
            <FormLabel>Evidence ID</FormLabel>
            <Input
              value={evId}
              onChange={(e) => setEvId(e.target.value)}
              placeholder="Enter Evidence ID"
              disabled={submitting}
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
          className="rounded-lg border p-4 flex items-center justify-center gap-3"
          style={{ borderColor: 'var(--border)' }}
        >
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
            accept="image/*"
            type="file"
            className="hidden"
            onChange={onPickFile}
          />
          {file && !previewUrl && (
            <span className="text-sm opacity-70 truncate max-w-60">{file.name}</span>
          )}
        </div>

        {previewUrl && (
          <div className="rounded-lg border p-3 mt-2" style={{ borderColor: 'var(--border)' }}>
            <img
              src={previewUrl}
              alt="preview"
              className="max-h-56 rounded-lg object-contain mx-auto"
            />
          </div>
        )}

        <FormLabel>Evidence Summary</FormLabel>
        <Textarea
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Write evidence summary"
          disabled={submitting}
        />

        {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
      </div>
    </Modal>
  )
}
