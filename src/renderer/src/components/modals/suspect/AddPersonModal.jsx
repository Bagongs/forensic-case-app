/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from '../Modal'
import FormLabel from '../../atoms/FormLabel'
import Radio from '../../atoms/Radio'
import Input from '../../atoms/Input'
import Textarea from '../../atoms/Textarea'
import Select from '../../atoms/Select'

const DEVICE_SOURCES = ['Hp', 'Ssd', 'HardDisk', 'Pc', 'Laptop', 'DVR']
const STATUS_OPTIONS = ['Witness', 'Reported', 'Suspected', 'Suspect', 'Defendant']

// Mapping label UI -> value yang diharapkan API
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
      return ''
  }
}

export default function AddPersonModal({ open, onClose, onSave, caseOptions = [] }) {
  const [caseId, setCaseId] = useState('')
  const [poiMode, setPoiMode] = useState('known') // 'known' | 'unknown'
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [idMode, setIdMode] = useState('gen') // 'gen' | 'manual'
  const [evidenceId, setEvidenceId] = useState('')
  const [source, setSource] = useState('')
  const [summary, setSummary] = useState('')
  const [notes, setNotes] = useState('')
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
    setCaseId('')
    setPoiMode('known')
    setName('')
    setStatus('')
    setIdMode('gen')
    setEvidenceId('')
    setSource('')
    setSummary('')
    setNotes('')
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

    // reset value biar bisa upload file yang sama lagi
    e.target.value = ''
  }

  const isUnknown = poiMode === 'unknown'
  const hasCase = !!caseId
  const hasName = name.trim().length > 0
  const hasStatus = !!status
  const hasManualEvidence = idMode === 'manual' && evidenceId.trim().length > 0
  const hasFile = !!file
  const hasEvidence = hasManualEvidence || hasFile

  // Kontrak API:
  // - case_id wajib
  // - jika is_unknown_person=false → person_name + suspect_status wajib
  // - minimal salah satu: evidence_number atau evidence_file
  const canSubmit = hasCase && (isUnknown || (hasName && hasStatus)) && hasEvidence && !submitting

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const is_unknown_person = isUnknown

      // siapkan payload file untuk IPC → main
      let evidenceFilePayload = null
      if (file) {
        const buf = await file.arrayBuffer()
        evidenceFilePayload = {
          name: file.name,
          type: file.type,
          size: file.size,
          buffer: Array.from(new Uint8Array(buf)) // supaya serializable lewat IPC
        }
      }

      const payload = {
        case_id: Number(caseId),
        is_unknown_person,
        person_name: is_unknown_person ? null : name.trim(),
        suspect_status: is_unknown_person ? null : status || null,
        evidence_number: idMode === 'manual' && evidenceId.trim() ? evidenceId.trim() : undefined,
        evidence_source: mapDeviceSourceToApi(source) || undefined,
        evidence_summary: summary.trim() || undefined,
        evidence_file: evidenceFilePayload || undefined
      }

      // 1) Create suspect
      const res = await window.api.suspects.create(payload)

      // ambil suspect_id dari response
      const suspectId = res?.data?.id ?? res?.data?.suspect_id ?? res?.data?.suspect?.id

      // 2) Kalau user isi Notes → kirim ke /suspects/save-suspect-notes
      const trimmedNotes = notes.trim()
      if (trimmedNotes && suspectId) {
        try {
          await window.api.suspects.saveNotes({
            suspect_id: Number(suspectId),
            notes: trimmedNotes
          })
        } catch (err) {
          // tidak menggagalkan create suspect,
          // hanya log error (bisa kamu upgrade nanti untuk tampil toast)
          console.error('Failed to save suspect notes', err)
        }
      }

      // 3) Tetap panggil onSave untuk parent (kalau dipakai)
      onSave?.({
        apiResponse: res,
        caseId,
        caseName: caseOptions.find((c) => String(c.value) === String(caseId))?.label,
        name: is_unknown_person ? 'Unknown' : name.trim(),
        status,
        notes: trimmedNotes,
        evidence: {
          idMode,
          id: idMode === 'gen' ? undefined : evidenceId.trim(),
          source,
          summary: summary.trim(),
          fileName: file?.name,
          fileSize: file?.size,
          fileMime: file?.type,
          previewDataUrl: previewUrl
        }
      })

      reset()
      onClose?.()
    } catch (err) {
      console.error('Failed to create suspect', err)
      setError(err?.message || 'Failed to create suspect')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Add Suspect"
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
        {/* CASE SELECT */}
        <FormLabel>Case Name</FormLabel>
        <Select value={caseId} onChange={(e) => setCaseId(e.target.value)} disabled={submitting}>
          <option value="" disabled>
            Select case
          </option>
          {caseOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>

        {/* PERSON MODE */}
        <FormLabel>Person of Interest</FormLabel>
        <div className="flex items-center gap-6">
          <Radio
            checked={poiMode === 'known'}
            onChange={() => {
              setPoiMode('known')
              setStatus('') // reset status kalau sebelumnya unknown
            }}
            disabled={submitting}
          >
            Person name
          </Radio>

          <Radio
            checked={poiMode === 'unknown'}
            onChange={() => {
              setPoiMode('unknown')
              setStatus('')
            }}
            disabled={submitting}
          >
            Unknown Person
          </Radio>
        </div>

        {/* PERSON DETAIL */}
        {poiMode === 'known' && (
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
                Select Status
              </option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </>
        )}

        {/* EVIDENCE ID MODE */}
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
              value={evidenceId}
              onChange={(e) => setEvidenceId(e.target.value)}
              placeholder="Enter Evidence ID"
              disabled={submitting}
            />
          </>
        )}

        {/* EVIDENCE SOURCE */}
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

        {/* EVIDENCE FILE */}
        <FormLabel>Evidence File</FormLabel>
        <div
          className="rounded-lg border p-4 flex items-center justify-center"
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
            <span className="ml-3 text-sm opacity-70 truncate max-w-60">{file.name}</span>
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

        {/* EVIDENCE SUMMARY */}
        <FormLabel>Evidence Summary</FormLabel>
        <Textarea
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Enter Evidence summary"
          disabled={submitting}
        />

        {/* NOTES */}
        <FormLabel>Notes (Optional)</FormLabel>
        <Textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter notes"
          data-optional="true"
          disabled={submitting}
        />

        {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
      </div>
    </Modal>
  )
}
