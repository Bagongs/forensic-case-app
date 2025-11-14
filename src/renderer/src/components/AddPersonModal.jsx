/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'

const DEVICE_SOURCES = ['Hp', 'Ssd', 'HardDisk', 'Pc', 'Laptop', 'DVR']
const STATUS_OPTIONS = ['Witness', 'Reported', 'Suspected', 'Suspect', 'Defendant']

export default function AddPersonModal({ open, onClose, onSave, caseOptions = [] }) {
  const [caseId, setCaseId] = useState(caseOptions[0]?.value || '')
  const [poiMode, setPoiMode] = useState('known')
  const [name, setName] = useState('')
  const [status, setStatus] = useState(null)
  const [idMode, setIdMode] = useState('gen')
  const [evidenceId, setEvidenceId] = useState('')
  const [source, setSource] = useState('')
  const [summary, setSummary] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!open) reset()
  }, [open])

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setCaseId(caseOptions[0]?.value || '')
    setPoiMode('known')
    setName('')
    setStatus(null)
    setIdMode('gen')
    setEvidenceId('')
    setSource('')
    setSummary('')
    setNotes('')
    setFile(null)
    setPreviewUrl(null)
  }

  async function onPickFile(e) {
    const f = e.target.files?.[0] || null
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)

    if (!f) return
    if (f.type?.startsWith('image/')) {
      // convert to base64 agar bisa disimpan
      const reader = new FileReader()
      reader.onload = (ev) => setPreviewUrl(ev.target.result)
      reader.readAsDataURL(f)
    }

    // reset value biar bisa upload file yang sama lagi
    e.target.value = ''
  }

  const canSubmit = caseId && (poiMode === 'unknown' || name.trim())

  return (
    <Modal
      open={open}
      title="Add Suspect"
      onCancel={() => {
        reset()
        onClose()
      }}
      confirmText="Submit"
      disableConfirm={!canSubmit}
      onConfirm={() => {
        onSave({
          caseId,
          caseName: caseOptions.find((c) => c.value === caseId)?.label,
          name: poiMode === 'unknown' ? 'Unknown' : name.trim(),
          status,
          notes: notes.trim(),
          evidence: {
            idMode,
            id: idMode === 'gen' ? undefined : evidenceId.trim(),
            source,
            summary: summary.trim(),
            fileName: file?.name,
            fileSize: file?.size,
            fileMime: file?.type,
            previewDataUrl: previewUrl // base64 data image
          }
        })
        reset()
        onClose()
      }}
      size="lg"
    >
      <div className="grid gap-3">
        <FormLabel>Case Name</FormLabel>
        <Select value={caseId} onChange={(e) => setCaseId(e.target.value)}>
          <option value="" disabled>
            Select case
          </option>
          {caseOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>

        <FormLabel>Person of Interest</FormLabel>
        <div className="flex items-center gap-6">
          <Radio checked={poiMode === 'known'} onChange={() => setPoiMode('known')}>
            Person name
          </Radio>
          <Radio checked={poiMode === 'unknown'} onChange={() => setPoiMode('unknown')}>
            Unknown Person
          </Radio>
        </div>

        {poiMode === 'known' && (
          <>
            <FormLabel>Person Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
            <FormLabel>Status</FormLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option selected disabled>
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

        <FormLabel>Evidence ID Mode</FormLabel>
        <div className="flex items-center gap-6">
          <Radio checked={idMode === 'gen'} onChange={() => setIdMode('gen')}>
            Generating
          </Radio>
          <Radio checked={idMode === 'manual'} onChange={() => setIdMode('manual')}>
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
            />
          </>
        )}

        <FormLabel>Evidence Source</FormLabel>
        <Select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="" selected disabled>
            Select device
          </option>
          {DEVICE_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <FormLabel>Evidence File</FormLabel>
        <div
          className="rounded-lg border p-4 flex items-center justify-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            className="px-4 py-1.5 rounded-lg border text-sm bg-[#394F6F]"
            style={{ borderColor: 'var(--border)' }}
            onClick={() => fileRef.current?.click()}
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

        <FormLabel>Evidence Summary</FormLabel>
        <Textarea
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Enter Evidence summary"
        />
        <FormLabel>Notes (Optional)</FormLabel>
        <Textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter notes"
        />
      </div>
    </Modal>
  )
}

/* atoms */
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
function Select(props) {
  return (
    <select
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
function Textarea(props) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
      style={{ borderColor: 'var(--border)' }}
    />
  )
}
