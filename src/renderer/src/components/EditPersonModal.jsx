/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'
import { useCases } from '../store/cases'
import { FaTrashAlt } from 'react-icons/fa'

const STATUS_OPTIONS = ['Witness', 'Reported', 'Suspected', 'Suspect', 'Defendant']

export default function EditPersonModal({
  open,
  onClose,
  caseId,
  person,
  author = '',
  showDelete = false,
  onRequestDelete = () => {} // ← NEW
}) {
  const updatePerson = useCases((s) => s.updatePerson)
  const addEvidenceToPerson = useCases((s) => s.addEvidenceToPerson)

  // person core
  const [name, setName] = useState('')
  const [status, setStatus] = useState(null)
  const [poiMode, setPoiMode] = useState('known')

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
      setStatus(person?.status || null)

      const mode = person?.name === 'Unknown' && person?.status == null ? 'unknown' : 'known'
      setPoiMode(mode)

      setAddEv(false)
      setEvIdMode('gen')
      setEvId('')
      setSource('')
      setSummary('')
      setFile(null)
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

  // 🔧 Ganti mode POI (Person of Interest)
  const changePoiMode = (mode) => {
    setPoiMode(mode)
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
        let finalName = name.trim()
        let finalStatus = status

        if (poiMode === 'unknown') {
          finalName = 'Unknown'
          finalStatus = null
        }

        updatePerson(caseId, person.id, { name: finalName, status: finalStatus }, author)

        if (addEv && (file || summary.trim())) {
          addEvidenceToPerson(caseId, person.id, {
            id: evIdMode === 'gen' ? undefined : evId.trim(),
            source,
            summary: summary.trim(),
            fileName: file?.name,
            fileSize: file?.size,
            fileMime: file?.type,
            previewDataUrl
          })
        }

        if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl)
        setPreviewBlobUrl(null)
        onClose?.()
      }}
      size="lg"
    >
      <div className="grid gap-3">
        <div className="flex justify-between gap-2 items-center">
          <FormLabel>Person of Interest</FormLabel>
          {showDelete && (
            <div
              onClick={onRequestDelete}
              className="bg-[#59120C] border border-[#9D120F] p-2 flex items-center justify-center"
            >
              <FaTrashAlt />
            </div>
          )}
        </div>
        {/* 🔘 Radio Buttons */}
        <div className="flex items-center gap-6">
          <Radio checked={poiMode === 'known'} onChange={() => changePoiMode('known')}>
            Person name
          </Radio>
          <Radio checked={poiMode === 'unknown'} onChange={() => changePoiMode('unknown')}>
            Unknown Person
          </Radio>
        </div>

        {poiMode == 'known' && (
          <>
            {/* 🧍 Person Name */}
            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
                Person Name
              </div>
              <input
                className="w-full px-3 py-2 rounded-lg border bg-transparent"
                style={{ borderColor: 'var(--border)' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                disabled={poiMode === 'unknown'}
              />
            </div>

            {/* 🏷️ Status Field */}
            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
                Status
              </div>
              <select
                className="w-full px-3 py-2 rounded-lg border bg-transparent"
                style={{ borderColor: 'var(--border)' }}
                value={status || ''}
                onChange={(e) => setStatus(e.target.value)}
                disabled={poiMode === 'unknown'}
              >
                <option value="" disabled>
                  Select Status
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

function FormLabel({ children }) {
  return (
    <div className="text-sm font-semibold" style={{ color: 'var(--dim)' }}>
      {children}
    </div>
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
