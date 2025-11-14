/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from '../Modal'
import { useCases } from '../../../store/cases'
import FormLabel from '../../atoms/FormLabel'
import Radio from '../../atoms/Radio'
import Input from '../../atoms/Input'
import Textarea from '../../atoms/Textarea'
import Select from '../../atoms/Select'

const DEVICE_SOURCES = ['Hp', 'Ssd', 'HardDisk', 'Pc', 'Laptop', 'DVR']
const STATUS_OPTIONS = ['Witness', 'Reported', 'Suspected', 'Suspect', 'Defendant']

export default function AddPersonInlineModal({ caseId, open, onClose }) {
  const { addPersonToCase } = useCases()
  const [mode, setMode] = useState('known')
  const [name, setName] = useState('')
  const [status, setStatus] = useState(null)
  const [evIdMode, setEvIdMode] = useState('gen')
  const [evId, setEvId] = useState('')
  const [source, setSource] = useState('')
  const [summary, setSummary] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!open) reset()
  }, [open])

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setMode('known')
    setName('')
    setStatus(null)
    setEvIdMode('gen')
    setEvId('')
    setSource('')
    setFile(null)
    setPreviewUrl(null)
    setSummary('')
  }

  async function onPickFile(e) {
    const f = e.target.files?.[0] || null
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)

    if (!f) return
    if (f.type?.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviewUrl(ev.target.result)
      reader.readAsDataURL(f)
    }

    e.target.value = ''
  }

  const canSubmit = mode === 'unknown' || name.trim()

  return (
    <Modal
      open={open}
      title="Add Person of Interest"
      onCancel={() => {
        reset()
        onClose?.()
      }}
      confirmText="Submit"
      disableConfirm={!canSubmit}
      onConfirm={() => {
        addPersonToCase(caseId, {
          name: mode === 'unknown' ? 'Unknown' : name.trim(),
          status,
          evidence: file
            ? {
                id: evIdMode === 'gen' ? undefined : evId.trim(),
                source,
                fileName: file.name,
                fileSize: file.size,
                mime: file.type,
                previewDataUrl: previewUrl,
                summary: summary.trim() || '(no summary)'
              }
            : undefined
        })
        reset()
        onClose?.()
      }}
      size="lg"
    >
      <div className="grid gap-3">
        <FormLabel>Person of Interest</FormLabel>
        <div className="flex items-center gap-6">
          <Radio
            checked={mode === 'known'}
            onChange={() => {
              setMode('known')
              setStatus('') // reset status kalau sebelumnya unknown
            }}
          >
            Person name
          </Radio>

          <Radio
            checked={mode === 'unknown'}
            onChange={() => {
              setMode('unknown')
              setStatus(null) // 🔥 null kalau unknown
            }}
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
            />
            <FormLabel>Status</FormLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option selected disabled>
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
          <Radio checked={evIdMode === 'gen'} onChange={() => setEvIdMode('gen')}>
            Generating
          </Radio>
          <Radio checked={evIdMode === 'manual'} onChange={() => setEvIdMode('manual')}>
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
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Write evidence summary"
        />
      </div>
    </Modal>
  )
}
