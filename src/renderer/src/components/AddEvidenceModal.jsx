/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'

const DEVICE_SOURCES = ['Hp', 'Ssd', 'HardDisk', 'Pc', 'Laptop', 'DVR']

export default function AddEvidenceModal({ open, onClose, onSave, caseOptions = [] }) {
  const [caseId, setCaseId] = useState('')
  const [idMode, setIdMode] = useState('manual')
  const [evidenceId, setEvidenceId] = useState('')
  const [source, setSource] = useState('')
  const [summary, setSummary] = useState('')
  const [investigator, setInvestigator] = useState('')
  const [poiMode, setPoiMode] = useState('known') // known | unknown
  const [personName, setPersonName] = useState('')
  const [etype, setEtype] = useState('')
  const [file, setFile] = useState(null)
  const [previewDataUrl, setPreviewDataUrl] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!open) cleanup()
  }, [open])

  function cleanup() {
    setFile(null)
    setPreviewDataUrl(null)
    setCaseId('')
    setIdMode('manual')
    setEvidenceId('')
    setSource('')
    setSummary('')
    setInvestigator('')
    setPoiMode('known')
    setPersonName('')
    setEtype('')
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
    if (f && f.type?.startsWith('image/')) {
      setPreviewDataUrl(await fileToDataURL(f)) // aman untuk CSP: img-src data:
    }
  }

  const canSubmit = caseId && !!file && (poiMode === 'unknown' || personName.trim())

  return (
    <Modal
      open={open}
      title="Add Evidence"
      onCancel={() => {
        cleanup()
        onClose()
      }}
      confirmText="Submit"
      disableConfirm={!canSubmit}
      onConfirm={() => {
        onSave({
          caseId,
          caseName: caseOptions.find((c) => c.value === caseId)?.label,
          idMode,
          id: idMode === 'gen' ? undefined : evidenceId.trim(),
          source,
          summary: summary.trim(),
          investigator: investigator.trim(),
          personOfInterest: poiMode === 'unknown' ? null : personName.trim(),
          type: etype,
          fileName: file?.name,
          fileSize: file?.size,
          fileMime: file?.type,
          previewDataUrl // ← ini yang dipakai summary & detail
        })
        cleanup()
      }}
      size="lg"
    >
      <div className="grid gap-4">
        <FormLabel>Case</FormLabel>
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

        <FormLabel>Evidence ID</FormLabel>
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
            value={evidenceId}
            onChange={(e) => setEvidenceId(e.target.value)}
            placeholder="ID"
          />
        )}

        <FormLabel>Source</FormLabel>
        <Select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="" disabled>
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
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-1.5 rounded-lg border text-sm hover:bg-white/10"
              style={{ borderColor: 'var(--border)' }}
              onClick={() => fileRef.current?.click()}
            >
              Upload
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={onPickFile} />
            {file && !previewDataUrl && (
              <span className="text-xs opacity-70 truncate max-w-[240px]">{file.name}</span>
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
          placeholder="Case Description"
        />

        <FormLabel>Investigator</FormLabel>
        <Input
          value={investigator}
          onChange={(e) => setInvestigator(e.target.value)}
          placeholder="Input name"
        />

        <FormLabel>Person of Interest</FormLabel>
        <div className="flex items-center gap-6">
          <Radio checked={poiMode === 'known'} onChange={() => setPoiMode('known')}>
            Person name
          </Radio>
          <Radio checked={poiMode === 'unknown'} onChange={() => setPoiMode('unknown')}>
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
            />
          </>
        )}

        <FormLabel>Type</FormLabel>
        <Select value={etype} onChange={(e) => setEtype(e.target.value)}>
          <option value="" disabled>
            Select type
          </option>
          {['Image', 'Video', 'Document', 'Log', 'APK'].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>
    </Modal>
  )
}

/* atoms */
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
