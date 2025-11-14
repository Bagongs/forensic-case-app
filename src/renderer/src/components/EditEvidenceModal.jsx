/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'

const DEVICE_SOURCES = ['Handphone', 'Laptop', 'PC', 'SSD', 'HDD', 'DVR', 'Flashdisk']
const STATUS_OPTIONS = ['Witness', 'Reported', 'Suspected', 'Suspect', 'Defendant']

export default function EditEvidenceModal({
  open,
  onClose,
  onSave,
  evidenceData = {}, // full object dari evidence
  caseName = '',
  personData = {}
}) {
  const [source, setSource] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState(null)
  const [investigator, setInvestigator] = useState('')
  const [poiMode, setPoiMode] = useState('unknown')
  const [personName, setPersonName] = useState('')
  const [file, setFile] = useState(null)
  const [previewDataUrl, setPreviewDataUrl] = useState(null)
  const fileRef = useRef(null)

  // isi default value ketika modal dibuka
  useEffect(() => {
    if (open && evidenceData) {
      setSource(evidenceData.source || '')
      setSummary(evidenceData.summary || '')
      setInvestigator(evidenceData.investigator || '')
      setPersonName(personData.name)
      setStatus(personData.status)
      // if (evidenceData.personOfInterest) {
      //   setPoiMode('known')
      //   setPersonName(evidenceData.personOfInterest)
      // } else {
      //   setPoiMode('unknown')
      //   setPersonName('')
      // }
      setPoiMode(personData.name != 'Unknown' ? 'known' : 'unknown')
      setPreviewDataUrl(evidenceData.previewDataUrl || evidenceData.previewUrl || null)
    }
  }, [open, evidenceData])

  const cleanup = () => {
    setFile(null)
    setPreviewDataUrl(null)
  }

  const fileToDataURL = (f) =>
    new Promise((res, rej) => {
      const fr = new FileReader()
      fr.onerror = rej
      fr.onload = () => res(String(fr.result))
      fr.readAsDataURL(f)
    })

  async function onPickFile(e) {
    const f = e.target.files?.[0]
    setFile(f || null)
    if (f && f.type?.startsWith('image/')) {
      setPreviewDataUrl(await fileToDataURL(f))
    } else {
      setPreviewDataUrl(null)
    }
  }

  return (
    <Modal
      open={open}
      title="Edit Evidence"
      onCancel={() => {
        cleanup()
        onClose?.()
      }}
      confirmText="Save"
      cancelText="Cancel"
      onConfirm={() => {
        onSave({
          ...evidenceData,
          source,
          summary,
          investigator,
          personOfInterest: poiMode === 'unknown' ? null : personName.trim(),
          fileName: file?.name || evidenceData.fileName,
          fileSize: file?.size || evidenceData.fileSize,
          fileMime: file?.type || evidenceData.fileMime,
          previewDataUrl,
          poiMode,
          personName,
          status
        })
        cleanup()
      }}
      size="lg"
    >
      <div className="grid gap-3">
        {/* === Case Related === */}
        <FormLabel>Case Related</FormLabel>
        <Input value={caseName} disabled readOnly />

        {/* === Evidence ID === */}
        <FormLabel>Evidence ID</FormLabel>
        <Input value={evidenceData.id || ''} disabled readOnly />

        {/* === Evidence Source === */}
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

        {/* === Evidence File === */}
        <FormLabel>Evidence</FormLabel>
        <div
          className="rounded-lg border p-4 flex items-center justify-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-1.5 rounded-lg border text-sm bg-[#394F6F]"
              style={{ borderColor: 'var(--border)' }}
              onClick={() => fileRef.current?.click()}
            >
              Upload
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={onPickFile} />
            {(file || evidenceData.fileName) && (
              <span className="text-sm opacity-70 truncate max-w-60">
                {file?.name || evidenceData.fileName}
              </span>
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

        {/* === Summary === */}
        <FormLabel>Evidence Summary</FormLabel>
        <Textarea
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Write evidence summary"
        />

        {/* === Investigator === */}
        <FormLabel>Investigator</FormLabel>
        <Input
          value={investigator}
          onChange={(e) => setInvestigator(e.target.value)}
          placeholder="Input investigator name"
        />

        {/* === Person of Interest === */}
        <FormLabel>Person of Interest</FormLabel>
        <div className="flex items-center gap-6">
          <Radio checked={poiMode === 'known'} onChange={() => setPoiMode('known')}>
            Person Name
          </Radio>
          <Radio checked={poiMode === 'unknown'} onChange={() => setPoiMode('unknown')}>
            Unknown Person
          </Radio>
        </div>

        {poiMode === 'known' && (
          <>
            <FormLabel>Person Name</FormLabel>
            <Input
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Input person name"
            />

            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
                Suspect Status
              </div>
              <select
                className="w-full px-3 py-2 rounded-lg border bg-transparent"
                style={{ borderColor: 'var(--border)' }}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option selected disabled>
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
      </div>
    </Modal>
  )
}

/* ====== atomic ui components ====== */
function FormLabel({ children }) {
  return (
    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
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
      className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
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
