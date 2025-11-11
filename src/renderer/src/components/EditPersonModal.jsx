/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'
import { useCases } from '../store/cases'

const STATUS_OPTIONS = ['Witness', 'Reported', 'Suspected', 'Suspect', 'Defendant']
const DEVICE_SOURCES = ['Hp', 'Ssd', 'HardDisk', 'Pc', 'Laptop', 'DVR']

export default function EditPersonModal({ open, onClose, caseId, person, author = '' }) {
  const updatePerson = useCases((s) => s.updatePerson)
  const addEvidenceToPerson = useCases((s) => s.addEvidenceToPerson)

  // person core
  const [name, setName] = useState('')
  const [status, setStatus] = useState('Suspect')

  // optional new evidence
  const [addEv, setAddEv] = useState(false)
  const [evIdMode, setEvIdMode] = useState('gen') // gen | manual
  const [evId, setEvId] = useState('')
  const [source, setSource] = useState('')
  const [summary, setSummary] = useState('')
  const [file, setFile] = useState(null)
  const [previewDataUrl, setPreviewDataUrl] = useState(null)
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null)
  const fileRef = useRef(null)

  // 🧩 RESET STATE SAAT OPEN BERUBAH
  useEffect(() => {
    if (open) {
      setName(person?.name || '')
      setStatus(person?.status || 'Suspect')
      setAddEv(false)
      setEvIdMode('gen')
      setEvId('')
      setSource('')
      setSummary('')
      setFile(null)
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl)
      setPreviewBlobUrl(null)
      setPreviewDataUrl(null)
    } else {
      // cleanup saat close
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl)
      setPreviewBlobUrl(null)
      setPreviewDataUrl(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, person?.id])

  // 🧩 HANDLE FILE PICK
  function onPickFile(e) {
    const f = e.target.files?.[0] || null
    setFile(f)
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl)
    setPreviewBlobUrl(null)
    setPreviewDataUrl(null)
    if (!f) return
    if (f.type?.startsWith('image/')) {
      const blobUrl = URL.createObjectURL(f)
      setPreviewBlobUrl(blobUrl)
      const reader = new FileReader()
      reader.onload = (ev) => setPreviewDataUrl(ev.target.result)
      reader.readAsDataURL(f)
    }
  }

  const canSubmit = name.trim().length > 0

  return (
    <Modal
      open={open}
      title="Edit Person of Interest"
      onCancel={() => {
        if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl)
        setPreviewBlobUrl(null)
        onClose()
      }}
      confirmText="Save"
      disableConfirm={!canSubmit}
      onConfirm={() => {
        // 1️⃣ Update core person data
        updatePerson(caseId, person.id, { name: name.trim(), status }, author)

        // 2️⃣ Optional: add new evidence
        if (addEv && (file || summary.trim())) {
          addEvidenceToPerson(caseId, person.id, {
            id: evIdMode === 'gen' ? undefined : evId.trim(),
            source,
            summary: summary.trim(),
            fileName: file?.name,
            fileSize: file?.size,
            fileMime: file?.type, // ✅ pakai fileMime, bukan mime
            previewDataUrl
          })
        }

        if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl)
        setPreviewBlobUrl(null)
        onClose?.()
      }}
      size="lg"
    >
      <div className="grid gap-4">
        {/* Person core */}
        <div>
          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Person Name
          </div>
          <input
            className="w-full px-3 py-2 rounded-lg border bg-transparent"
            style={{ borderColor: 'var(--border)' }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
        </div>

        {/* STATUS FIELD */}
        <div>
          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Status
          </div>
          <select
            className="w-full px-3 py-2 rounded-lg border bg-transparent"
            style={{ borderColor: 'var(--border)' }}
            value={status} // ✅ status terkontrol
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Optional Evidence Section */}
        {/* <div className="border-t my-2" style={{ borderColor: 'var(--border)' }} />

        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="accent-indigo-400"
            checked={addEv}
            onChange={(e) => setAddEv(e.target.checked)}
          />
          <span className="text-sm">Add evidence (optional)</span>
        </label> */}

        {/* {addEv && (
          <>
            <div>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dim)' }}>
                Evidence ID
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    className="accent-indigo-400"
                    checked={evIdMode === 'gen'}
                    onChange={() => setEvIdMode('gen')}
                  />
                  Generating
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    className="accent-indigo-400"
                    checked={evIdMode === 'manual'}
                    onChange={() => setEvIdMode('manual')}
                  />
                  Manual input
                </label>
              </div>
              {evIdMode === 'manual' && (
                <input
                  className="w-full px-3 py-2 rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="Enter evidence ID"
                  value={evId}
                  onChange={(e) => setEvId(e.target.value)}
                />
              )}
            </div>

            <div>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dim)' }}>
                Evidence Source
              </div>
              <select
                className="w-full px-3 py-2 rounded-lg border bg-transparent"
                style={{ borderColor: 'var(--border)' }}
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="" disabled>
                  Select source
                </option>
                {DEVICE_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dim)' }}>
                Evidence Summary
              </div>
              <textarea
                rows={3}
                className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
                style={{ borderColor: 'var(--border)' }}
                placeholder="Write evidence summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <div>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dim)' }}>
                Evidence File
              </div>
              <div
                className="rounded-lg border p-4 flex items-center justify-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  className="px-4 py-1.5 rounded-lg border text-sm hover:bg-white/10"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => fileRef.current?.click()}
                >
                  Upload
                </button>
                <input ref={fileRef} type="file" className="hidden" onChange={onPickFile} />
                {file && !previewBlobUrl && (
                  <span className="ml-3 text-xs opacity-70 truncate max-w-[240px] sm:max-w-[360px]">
                    {file.name}
                  </span>
                )}
              </div>

              {previewBlobUrl && (
                <div
                  className="rounded-lg border p-3 mt-2"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <img
                    src={previewBlobUrl}
                    alt="preview"
                    className="max-h-56 rounded-lg object-contain mx-auto"
                  />
                </div>
              )}
            </div>
          </>
        )} */}
      </div>
    </Modal>
  )
}
