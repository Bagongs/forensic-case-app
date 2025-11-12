/* eslint-disable react-hooks/exhaustive-deps */
// src/renderer/src/components/AddPersonInlineModal.jsx
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'
import { useCases } from '../store/cases'

const DEVICE_SOURCES = ['Hp', 'Ssd', 'HardDisk', 'Pc', 'Laptop', 'DVR']
const STATUS_OPTIONS = ['Witness', 'Reported', 'Suspected', 'Suspect', 'Defendant']

export default function AddPersonInlineModal({ caseId, open, onClose }) {
  const { addPersonToCase } = useCases()

  const [mode, setMode] = useState('known') // known | unknown
  const [name, setName] = useState('')

  // 🆕 status person
  const [status, setStatus] = useState('Suspect')

  const [evIdMode, setEvIdMode] = useState('gen') // gen | manual
  const [evId, setEvId] = useState('')
  const [source, setSource] = useState('')

  const [file, setFile] = useState(null)
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null) // pratinjau di modal
  const [previewDataUrl, setPreviewDataUrl] = useState(null) // disimpan ke store
  const [summary, setSummary] = useState('') // evidence summary

  const fileRef = useRef(null)

  useEffect(() => {
    if (!open) reset()
  }, [open])

  function reset() {
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl)
    setMode('known')
    setName('')
    setStatus('Suspect') // reset status
    setEvIdMode('gen')
    setEvId('')
    setSource('')
    setFile(null)
    setPreviewBlobUrl(null)
    setPreviewDataUrl(null)
    setSummary('')
  }

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

  const canSubmit = mode === 'unknown' || name.trim()

  return (
    <Modal
      open={open}
      title="Add Person"
      onCancel={() => {
        reset()
        onClose?.()
      }}
      confirmText="Submit"
      disableConfirm={!canSubmit}
      onConfirm={() => {
        addPersonToCase(caseId, {
          name: mode === 'unknown' ? 'Unknown Person' : name.trim(),
          status, // ✅ kirim status yang dipilih
          evidence: file
            ? {
                id: evIdMode === 'gen' ? undefined : evId.trim(),
                source,
                fileName: file.name,
                fileSize: file.size,
                mime: file.type,
                previewDataUrl,
                summary: summary.trim() || '(no summary)'
              }
            : undefined
        })
        reset()
        onClose?.()
      }}
      size="lg"
    >
      <div className="grid gap-4">
        {/* PERSON INFO */}
        <div className="text-xs font-semibold" style={{ color: 'var(--dim)' }}>
          Person of Interest
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              className="accent-indigo-400"
              checked={mode === 'known'}
              onChange={() => setMode('known')}
            />
            Person name
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              className="accent-indigo-400"
              checked={mode === 'unknown'}
              onChange={() => setMode('unknown')}
            />
            Unknown Person
          </label>
        </div>

        {mode === 'known' && (
          <div>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dim)' }}>
              Person Name
            </div>
            <input
              className="w-full px-3 py-2 rounded-lg border bg-transparent"
              style={{ borderColor: 'var(--border)' }}
              placeholder="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        {/* 🆕 STATUS */}
        <div>
          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Suspect Status
          </div>
          <select
            className="w-full px-3 py-2 rounded-lg border bg-transparent"
            style={{ borderColor: 'var(--border)' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* EVIDENCE ID */}
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
              placeholder="evidence id"
              value={evId}
              onChange={(e) => setEvId(e.target.value)}
            />
          )}
        </div>

        {/* SOURCE */}
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
            <option value="" selected disabled>
              Select device
            </option>
            {DEVICE_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* EVIDENCE SUMMARY */}
        <div>
          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Evidence Summary
          </div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write evidence summary"
            className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
            rows={3}
            style={{ borderColor: 'var(--border)' }}
          />
        </div>

        {/* FILE */}
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
            <div className="rounded-lg border p-3 mt-2" style={{ borderColor: 'var(--border)' }}>
              <img
                src={previewBlobUrl}
                alt="preview"
                className="max-h-56 rounded-lg object-contain mx-auto"
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
