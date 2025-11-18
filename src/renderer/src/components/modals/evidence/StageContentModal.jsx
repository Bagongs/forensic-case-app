/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react'
import { FaFilePdf } from 'react-icons/fa6'
import { useEvidenceChain } from '../../../store/evidenceChain'
import Modal from '../Modal'

const TOKENS = {
  modalBg: '#151D28',
  ring: '#394F6F',
  text: '#F4F6F8',
  dim: '#F4F6F8',
  gold: '#EDC702',
  statusBg: '#2C3C53'
}

export const STAGES = {
  ACQUISITION: 'acquisition',
  PREPARATION: 'preparation',
  EXTRACTION: 'extraction',
  ANALYSIS: 'analysis'
}

const DEVICE_SOURCES = ['Hp', 'Ssd', 'HardDisk', 'Pc', 'Laptop', 'DVR']

/* =============== PRIMITIVES =============== */
const Label = ({ children }) => (
  <div className="text-sm mb-2" style={{ color: TOKENS.dim, fontWeight: 500 }}>
    {children}
  </div>
)
const Input = (p) => (
  <input
    {...p}
    className={`w-full h-11 rounded-md bg-transparent px-3 text-sm outline-none ${p.className || ''}`}
    style={{ color: TOKENS.text, border: `1px solid ${TOKENS.ring}` }}
  />
)
const Select = ({ options = [], ...p }) => (
  <select
    {...p}
    className="w-full h-11 rounded-md bg-transparent px-3 text-sm outline-none appearance-none"
    style={{ color: TOKENS.text, border: `1px solid ${TOKENS.ring}` }}
  >
    {options.map((o) => {
      const val = typeof o === 'object' ? o.value : o
      const label = typeof o === 'object' ? o.label : o
      return (
        <option
          key={val ?? label}
          value={val ?? label}
          style={{ background: '#0F1621', color: TOKENS.text }}
        >
          {label}
        </option>
      )
    })}
  </select>
)
const Textarea = (p) => (
  <textarea
    {...p}
    rows={p.rows ?? 3}
    className="w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none resize-y"
    style={{ color: TOKENS.text, border: `1px solid ${TOKENS.ring}` }}
  />
)
const Field = ({ label, children }) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
)
const Row = ({ children, cols = 2 }) => (
  <div
    className={`grid gap-4 ${cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}
  >
    {children}
  </div>
)

/* =============== MAIN COMPONENT =============== */
export default function StageContentModal({
  open,
  caseNumber,
  caseTitle,
  initialStage = STAGES.ACQUISITION,
  onClose,
  onSubmitStage,
  investigationTools
}) {
  const [stage, setStage] = useState(initialStage)
  const [submitting, setSubmitting] = useState(false)
  const collectorRef = useRef(null)

  useEffect(() => {
    if (open) setStage(initialStage)
  }, [open, initialStage])

  const title = useMemo(
    () =>
      ({
        acquisition: 'Acquisition',
        preparation: 'Preparation',
        extraction: 'Extraction',
        analysis: 'Analysis'
      })[stage] || 'Stage',
    [stage]
  )

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const payload = (await collectorRef.current?.()) ?? {}
      await onSubmitStage?.(stage, payload)
      onClose?.()
    } finally {
      setSubmitting(false)
    }
  }

  const header = (
    <div className="flex flex-col p-5 justify-center items-center gap-2">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <span className="text-xl font-bold text-yellow-400">{caseNumber}</span>
      <span className="text-sm text-gray-200">{caseTitle}</span>
    </div>
  )

  return (
    <Modal
      open={open}
      header={header}
      size="xl"
      onCancel={onClose}
      onConfirm={handleSubmit}
      confirmText={submitting ? 'Saving...' : 'Submit'}
      disableConfirm={submitting}
    >
      <div className="space-y-6">
        {stage === STAGES.ACQUISITION && (
          <AcquisitionPanel registerCollector={(fn) => (collectorRef.current = fn)} />
        )}
        {stage === STAGES.PREPARATION && (
          <PreparationPanel registerCollector={(fn) => (collectorRef.current = fn)} />
        )}
        {stage === STAGES.EXTRACTION && (
          <ExtractionPanel registerCollector={(fn) => (collectorRef.current = fn)} />
        )}
        {stage === STAGES.ANALYSIS && (
          <AnalysisPanel
            open={open}
            investigationTools={investigationTools}
            registerCollector={(fn) => (collectorRef.current = fn)}
          />
        )}
      </div>
    </Modal>
  )
}

/* =============== ACQUISITION =============== */
function AcquisitionPanel({ registerCollector }) {
  const { acquisition, setStageData } = useEvidenceChain()
  const [v, setV] = useState({
    investigator: '',
    location: '',
    source: '',
    type: '',
    stage: '',
    detail: '',
    steps: [''],
    photos: [null],
    notes: '',
    ...acquisition
  })

  const setPhoto = (i, file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const next = [...v.photos]
      next[i] = reader.result
      setV({ ...v, photos: next })
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    registerCollector(async () => {
      const stepsObj = (v.steps || []).map((desc, i) => ({
        no: i + 1,
        desc,
        previewDataUrl: v.photos?.[i] || null
      }))
      const payload = {
        ...v,
        steps: stepsObj,
        id: crypto.randomUUID(),
        stage: STAGES.ACQUISITION,
        createdAt: new Date().toISOString()
      }
      setStageData(STAGES.ACQUISITION, payload)
      return payload
    })
  }, [v])

  return (
    <>
      <Row>
        <Field label="Investigator">
          <Input
            value={v.investigator}
            onChange={(e) => setV({ ...v, investigator: e.target.value })}
            placeholder="Name"
          />
        </Field>
        <Field label="Location">
          <Input
            value={v.location}
            onChange={(e) => setV({ ...v, location: e.target.value })}
            placeholder="Location"
          />
        </Field>
      </Row>

      <Row cols={3}>
        <Field label="Evidence Source">
          <Select
            value={v.source}
            onChange={(e) => setV({ ...v, source: e.target.value })}
            options={DEVICE_SOURCES}
          />
        </Field>
        <Field label="Evidence Type">
          <Input
            value={v.type}
            onChange={(e) => setV({ ...v, type: e.target.value })}
            placeholder="Evidence Type"
          />
        </Field>
        <Field label="Evidence Detail">
          <Input
            value={v.detail}
            onChange={(e) => setV({ ...v, detail: e.target.value })}
            placeholder="Evidence Detail"
          />
        </Field>
      </Row>

      <Label>Steps for Confiscating Evidence</Label>
      {v.steps.map((s, i) => (
        <div key={i} className="flex items-start gap-3 mb-3">
          <Input
            value={s}
            placeholder={`${i + 1}.`}
            onChange={(e) => {
              const next = [...v.steps]
              next[i] = e.target.value
              setV({ ...v, steps: next })
            }}
          />
          {v.photos?.[i] ? (
            <div className="flex flex-col items-center gap-2 text-nowrap">
              <img
                src={v.photos[i]}
                alt={`step-${i + 1}`}
                className="w-28 h-20 object-cover rounded-md"
                style={{ border: `1px solid ${TOKENS.ring}` }}
              />
              <label
                className="cursor-pointer px-3 py-3 border rounded-sm text-sm "
                style={{ backgroundColor: '#394F6F', border: 'none' }}
              >
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setPhoto(i, e.target.files[0])}
                />
              </label>
            </div>
          ) : (
            <label
              className="cursor-pointer px-4 py-3 border rounded-sm text-sm text-nowrap"
              style={{ backgroundColor: '#394F6F', border: 'none' }}
            >
              Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setPhoto(i, e.target.files[0])}
              />
            </label>
          )}
        </div>
      ))}
      <button
        onClick={() => setV({ ...v, steps: [...v.steps, ''], photos: [...v.photos, null] })}
        className="h-10 px-4 rounded-md text-sm mt-2 bg-[#394F6F]"
        style={{ border: `1px solid ${TOKENS.ring}`, color: TOKENS.text }}
      >
        + Add
      </button>

      <Field label="Notes (Optional)">
        <Textarea
          value={v.notes}
          onChange={(e) => setV({ ...v, notes: e.target.value })}
          placeholder="Evidence notes"
          data-optional="true"
        />
      </Field>
    </>
  )
}

/* =============== PREPARATION =============== */
function PreparationPanel({ registerCollector }) {
  const { preparation, setStageData } = useEvidenceChain()
  const [v, setV] = useState({
    investigator: '',
    location: '',
    source: '',
    type: '',
    stage: '',
    detail: '',
    pairs: [{ investigation: '', tools: '' }],
    notes: '',
    ...preparation
  })

  const addPair = () => setV({ ...v, pairs: [...v.pairs, { investigation: '', tools: '' }] })

  useEffect(() => {
    registerCollector(async () => {
      const payload = {
        ...v,
        id: crypto.randomUUID(),
        stage: STAGES.PREPARATION,
        createdAt: new Date().toISOString()
      }
      setStageData(STAGES.PREPARATION, payload)
      return payload
    })
  }, [v])

  const setPair = (i, key, val) => {
    const next = [...v.pairs]
    next[i][key] = val
    setV({ ...v, pairs: next })
  }

  return (
    <>
      <Row>
        <Field label="Investigator">
          <Input
            value={v.investigator}
            onChange={(e) => setV({ ...v, investigator: e.target.value })}
            placeholder="Name"
          />
        </Field>
        <Field label="Location">
          <Input
            value={v.location}
            onChange={(e) => setV({ ...v, location: e.target.value })}
            placeholder="Location"
          />
        </Field>
      </Row>

      <Row cols={3}>
        <Field label="Evidence Source">
          <Select
            value={v.source}
            onChange={(e) => setV({ ...v, source: e.target.value })}
            options={DEVICE_SOURCES}
          />
        </Field>
        <Field label="Evidence Type">
          <Input
            value={v.type}
            onChange={(e) => setV({ ...v, type: e.target.value })}
            placeholder="Evidence Type"
          />
        </Field>
        <Field label="Evidence Detail">
          <Input
            value={v.detail}
            onChange={(e) => setV({ ...v, detail: e.target.value })}
            placeholder="Evidence Detail"
          />
        </Field>
      </Row>

      <div className="grid grid-cols-2 gap-3 mb-0 items-start">
        <Label>Investigation Hypothesis</Label>
        <Label>Tool Used</Label>
      </div>
      {v.pairs.map((p, i) => (
        <div key={i} className="grid grid-cols-2 gap-3 mb-3 items-start">
          <Input
            placeholder={`${i + 1}.`}
            value={p.investigation}
            onChange={(e) => setPair(i, 'investigation', e.target.value)}
          />
          <div>
            <Select
              value={p.tools}
              onChange={(e) => setPair(i, 'tools', e.target.value)}
              options={[
                { label: 'Select tools', value: '' },
                { label: 'Magnet Axiom', value: 'Magnet Axiom' },
                { label: 'Oxygen', value: 'Oxygen' },
                { label: 'Cellebrite', value: 'Cellebrite' },
                { label: 'Encase', value: 'Encase' }
              ]}
            />
          </div>
        </div>
      ))}

      <button
        onClick={addPair}
        className="h-10 px-4 border rounded-md text-sm bg-[#394F6F] text-gray-200"
        style={{ borderColor: TOKENS.ring }}
      >
        + Add
      </button>

      <Field label="Notes (Optional)">
        <Textarea
          value={v.notes}
          onChange={(e) => setV({ ...v, notes: e.target.value })}
          placeholder="Evidence notes"
          data-optional="true"
        />
      </Field>
    </>
  )
}

/* =============== EXTRACTION =============== */
function ExtractionPanel({ registerCollector }) {
  const { extraction, setStageData } = useEvidenceChain()
  const [v, setV] = useState({
    investigator: '',
    location: '',
    source: '',
    type: '',
    stage: '',
    detail: '',
    files: [],
    notes: '',
    ...extraction
  })

  // helper konversi byte ke label
  const approxSizeLabel = (base64) => {
    if (!base64) return '-'
    const sizeInBytes = Math.ceil((base64.length * 3) / 4) - 2
    if (sizeInBytes < 1024) return `${sizeInBytes} B`
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
    return `${(sizeInBytes / 1024 / 1024).toFixed(2)} MB`
  }

  // helper upload
  const addFile = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result
      const sizeLabel = approxSizeLabel(base64)
      setV({
        ...v,
        files: [
          {
            name: file.name,
            mime: file.type,
            size: sizeLabel,
            base64
          }
        ] // single file (replace array)
      })
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    registerCollector(async () => {
      const payload = {
        ...v,
        id: crypto.randomUUID(),
        stage: STAGES.EXTRACTION,
        createdAt: new Date().toISOString()
      }
      setStageData(STAGES.EXTRACTION, payload)
      return payload
    })
  }, [v])

  return (
    <>
      <Row>
        <Field label="Investigator">
          <Input
            value={v.investigator}
            onChange={(e) => setV({ ...v, investigator: e.target.value })}
            placeholder="Name"
          />
        </Field>
        <Field label="Location">
          <Input
            value={v.location}
            onChange={(e) => setV({ ...v, location: e.target.value })}
            placeholder="Location"
          />
        </Field>
      </Row>

      <Row cols={3}>
        <Field label="Evidence Source">
          <Select
            value={v.source}
            onChange={(e) => setV({ ...v, source: e.target.value })}
            options={DEVICE_SOURCES}
          />
        </Field>
        <Field label="Evidence Type">
          <Input
            value={v.type}
            onChange={(e) => setV({ ...v, type: e.target.value })}
            placeholder="Evidence Type"
          />
        </Field>
        <Field label="Evidence Detail">
          <Input
            value={v.detail}
            onChange={(e) => setV({ ...v, detail: e.target.value })}
            placeholder="Evidence Detail"
          />
        </Field>
      </Row>

      <Field label="Extraction Result">
        <div className="border border-[#394F6F] flex justify-center py-10">
          <label className="cursor-pointer h-11 px-5 rounded-md flex items-center justify-center w-fit text-sm text-gray-200 bg-[#394F6F]">
            Upload
            <input
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && addFile(e.target.files[0])}
            />
          </label>
        </div>

        {v.files.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-gray-400">
            <li>
              📄 {v.files[0].name} — <span className="text-[#9FAEC1]">{v.files[0].size}</span>
            </li>
          </ul>
        )}
      </Field>

      <Field label="Notes (Optional)">
        <Textarea
          value={v.notes}
          onChange={(e) => setV({ ...v, notes: e.target.value })}
          placeholder="Evidence Notes"
          data-optional="true"
        />
      </Field>
    </>
  )
}

/* =============== ANALYSIS (RESET SETIAP OPEN) =============== */
function AnalysisPanel({ open, registerCollector, investigationTools }) {
  const { preparation, setStageData } = useEvidenceChain()

  const prepPairs =
    preparation?.pairs ??
    preparation?.hypothesis?.map((h, i) => ({
      investigation: h,
      tools: preparation.tool[i] ?? ''
    })) ??
    investigationTools?.pairs ??
    []

  const buildDefaults = () => ({
    investigator: '',
    location: '',
    source: '',
    type: '',
    stage: '',
    detail: '',
    analysisPairs: prepPairs.map((p) => ({
      investigation: p.investigation || '',
      tools: p.tools || '',
      result: ''
    })),
    reports: [], // ⬅️ selalu kosong saat mulai
    notes: ''
  })

  const [v, setV] = useState(buildDefaults)

  // Reset setiap kali modal dibuka / pasangan preparation berubah
  useEffect(() => {
    if (open) setV(buildDefaults())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preparation])

  // helper upload
  const addReport = (file) => {
    const reader = new FileReader()
    reader.onload = () =>
      setV((prev) => ({
        ...prev,
        reports: [
          ...(prev.reports || []),
          { name: file.name, mime: file.type, base64: reader.result }
        ]
      }))
    reader.readAsDataURL(file)
  }
  const addReports = (files) => Array.from(files || []).forEach(addReport)

  useEffect(() => {
    registerCollector(async () => {
      const payload = {
        ...v,
        id: crypto.randomUUID(),
        stage: STAGES.ANALYSIS,
        createdAt: new Date().toISOString()
      }
      setStageData(STAGES.ANALYSIS, payload)
      return payload
    })
  }, [v])

  const setResult = (i, val) => {
    const next = [...v.analysisPairs]
    next[i].result = val
    setV({ ...v, analysisPairs: next })
  }

  return (
    <>
      <Row>
        <Field label="Investigator">
          <Input
            value={v.investigator}
            onChange={(e) => setV({ ...v, investigator: e.target.value })}
            placeholder="Name"
          />
        </Field>
        <Field label="Location">
          <Input
            value={v.location}
            onChange={(e) => setV({ ...v, location: e.target.value })}
            placeholder="Location"
          />
        </Field>
      </Row>

      <Row cols={3}>
        <Field label="Evidence Source">
          <Select
            value={v.source}
            onChange={(e) => setV({ ...v, source: e.target.value })}
            options={DEVICE_SOURCES}
          />
        </Field>
        <Field label="Evidence Type">
          <Input
            value={v.type}
            onChange={(e) => setV({ ...v, type: e.target.value })}
            placeholder="Evidence Type"
          />
        </Field>
        <Field label="Evidence Detail">
          <Input
            value={v.detail}
            onChange={(e) => setV({ ...v, detail: e.target.value })}
            placeholder="Evidence Detail"
          />
        </Field>
      </Row>

      <div className="flex flex-row gap-5 w-full">
        <div className="flex flex-col gap-2 w-full">
          <Label>Investigation Hypothesis</Label>
          {v.analysisPairs.map((p, i) => (
            <Input key={i} readOnly value={p.investigation} className="mb-3" />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Label>Tool Used</Label>
          {v.analysisPairs.map((p, i) => (
            <Input key={i} readOnly value={p.tools} className="mb-3" />
          ))}
        </div>
      </div>

      <Label>Analysis Result</Label>
      {v.analysisPairs.map((p, i) => (
        <Input
          key={i}
          placeholder={`${i + 1}.`}
          value={p.result}
          onChange={(e) => setResult(i, e.target.value)}
          className="mb-2"
        />
      ))}

      {/* ===== Upload Report (container border + tombol center) ===== */}
      <Field label={`Upload Report (${v.reports?.length || 0})`}>
        <div
          className="w-full rounded-md flex items-center justify-center"
          style={{ border: `1px solid ${TOKENS.ring}`, background: 'transparent', minHeight: 88 }}
        >
          <label
            className="cursor-pointer h-11 px-6 rounded-md flex items-center justify-center text-sm font-medium"
            style={{ background: '#394F6F', color: TOKENS.text }}
          >
            Upload
            <input
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                addReports(e.target.files)
                e.target.value = null // reset agar bisa pilih file yang sama
              }}
            />
          </label>
        </div>

        {/* List file di bawah container */}
        <div className="mt-3 space-y-3">
          {(v.reports || []).map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center justify-between rounded-md px-4 py-3"
              style={{ border: `1px solid ${TOKENS.ring}` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FaFilePdf size={18} color={TOKENS.text} />
                <span className="text-sm truncate" style={{ color: TOKENS.text }}>
                  {f.name}
                </span>
              </div>
              <span
                className="text-sm px-3 py-1 rounded-md"
                style={{ background: TOKENS.statusBg, color: TOKENS.text }}
              >
                Uploaded
              </span>
            </div>
          ))}
        </div>
      </Field>

      <Field label="Notes (Optional)">
        <Textarea
          rows={3}
          value={v.notes}
          onChange={(e) => setV({ ...v, notes: e.target.value })}
          placeholder="Evidence Notes"
          data-optional="true"
        />
      </Field>
    </>
  )
}
