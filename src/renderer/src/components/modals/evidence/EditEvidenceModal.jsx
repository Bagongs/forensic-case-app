/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from '../Modal'
import FormLabel from '../../atoms/FormLabel'
import Radio from '../../atoms/Radio'
import Input from '../../atoms/Input'
import Textarea from '../../atoms/Textarea'
import Select from '../../atoms/Select'

const DEVICE_SOURCES = ['Handphone', 'SSD', 'Harddisk', 'PC', 'Laptop', 'DVR']
const STATUS_OPTIONS = ['Witness', 'Reported', 'Suspected', 'Suspect', 'Defendant']

export default function EditEvidenceModal({
  open,
  onClose,
  onSave,
  evidenceData = {},
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

  useEffect(() => {
    if (open && evidenceData) {
      setSource(evidenceData.source || '')
      setSummary(evidenceData.summary || '')
      setInvestigator(evidenceData.investigator || '')
      setPersonName(personData.name || '')
      setStatus(personData.status || null)
      setPoiMode(personData.name && personData.name !== 'Unknown' ? 'known' : 'unknown')
      setPreviewDataUrl(evidenceData.previewDataUrl || evidenceData.previewUrl || null)
      setFile(null)
    }
  }, [open, evidenceData, personData])

  const fileToDataURL = (f) =>
    new Promise((res, rej) => {
      const fr = new FileReader()
      fr.onerror = rej
      fr.onload = () => res(String(fr.result))
      fr.readAsDataURL(f)
    })

  async function onPickFile(e) {
    const f = e.target.files?.[0] || null
    setFile(f)

    if (f && f.type?.startsWith('image/')) {
      setPreviewDataUrl(await fileToDataURL(f))
    } else {
      setPreviewDataUrl(null)
    }

    e.target.value = ''
  }

  return (
    <Modal
      open={open}
      title="Edit Evidence"
      onCancel={() => onClose?.()}
      confirmText="Save"
      cancelText="Cancel"
      onConfirm={() => {
        onSave?.({
          ...evidenceData,
          source,
          summary,
          investigator,

          poiMode,
          personName,
          status,

          // kirim File mentah
          file,
          previewDataUrl
        })
        onClose?.()
      }}
      size="lg"
    >
      <div className="grid gap-3">
        <FormLabel>Case Related</FormLabel>
        <Input value={caseName} disabled readOnly />

        <FormLabel>Evidence ID</FormLabel>
        <Input value={evidenceData.id || ''} disabled readOnly />

        <FormLabel>Evidence Source</FormLabel>
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

        <FormLabel>Evidence</FormLabel>
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
            >
              Upload
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg, .jpeg, .png, .gif, .bmp, .webp"
              className="hidden"
              onChange={onPickFile}
            />
            {(file || evidenceData.fileName) && (
              <span className="text-sm opacity-70 truncate max-w-60">
                {file?.name || evidenceData.fileName}
              </span>
            )}
          </div>
        </div>

        {previewDataUrl && (
          <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
            <img src={previewDataUrl} alt="preview" className="max-h-56 rounded-lg mx-auto" />
          </div>
        )}

        <FormLabel>Evidence Summary</FormLabel>
        <Textarea
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Write evidence summary"
        />

        <FormLabel>Investigator</FormLabel>
        <Input
          value={investigator}
          onChange={(e) => setInvestigator(e.target.value)}
          placeholder="Input investigator name"
        />

        <FormLabel>Person of Interest</FormLabel>
        <div className="flex items-center gap-6">
          <Radio
            checked={poiMode === 'known'}
            onChange={() => {
              setPoiMode('known')
              setStatus('')
            }}
          >
            Person Name
          </Radio>

          <Radio
            checked={poiMode === 'unknown'}
            onChange={() => {
              setPoiMode('unknown')
              setStatus(null)
            }}
          >
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

            <FormLabel>Suspect Status</FormLabel>
            <select
              className="w-full px-3 py-2 rounded-lg border bg-[#151d28]"
              style={{ borderColor: 'var(--border)' }}
              value={status || ''}
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
          </>
        )}
      </div>
    </Modal>
  )
}
