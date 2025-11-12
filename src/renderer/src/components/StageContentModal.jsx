/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { useEvidenceChain } from '../store/evidenceChain'

const TOKENS = {
  modalBg: '#151D28',
  ring: '#394F6F',
  text: '#F4F6F8',
  dim: '#A8B3C4',
  gold: '#EDC702'
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
  <div className="text-sm mb-2" style={{ color: TOKENS.dim }}>
    {children}
  </div>
)
const Input = (p) => (
  <input
    {...p}
    className="w-full h-11 rounded-md bg-transparent px-3 text-sm outline-none"
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

/* =============== MAIN MODAL =============== */
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
  const { preparation } = useEvidenceChain()

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

  if (!open) return null

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

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-[min(920px,95vw)] max-h-[92vh] rounded-xl overflow-hidden flex flex-col"
        style={{ background: TOKENS.modalBg }}
      >
        <header className="px-6 pt-6 pb-5 border-b" style={{ borderColor: TOKENS.ring }}>
          <div className="flex justify-between">
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: TOKENS.text }}>
                {title}
              </h1>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl font-bold text-yellow-400">{caseNumber}</span>
                <span className="text-lg text-gray-200">{caseTitle}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2">
              <IoClose size={28} color={TOKENS.text} />
            </button>
          </div>
        </header>

        <div className="p-6 overflow-auto space-y-6">
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
              investigationTools={investigationTools}
              registerCollector={(fn) => (collectorRef.current = fn)}
            />
          )}
        </div>

        <footer className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="h-11 px-6 rounded-md text-sm border border-yellow-400 text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-11 px-6 rounded-md text-sm bg-yellow-400 text-black font-semibold"
          >
            {submitting ? 'Saving...' : 'Submit'}
          </button>
        </footer>
      </div>
    </div>
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
  // const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0)

  const addStep = () => setV({ ...v, steps: [...v.steps, ''], photos: [...v.photos, null] })

  const setPhoto = (i, file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const next = [...v.photos]
      next[i] = reader.result
      setV({ ...v, photos: next })
      // setCurrentPhotoIdx(i)
    }
    reader.readAsDataURL(file)
  }

  // const uploadedPhotos = (v.photos || []).map((p, idx) => ({ src: p, idx })).filter((p) => !!p.src)

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
          />
        </Field>
        <Field label="Location">
          <Input value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} />
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
          <Input value={v.type} onChange={(e) => setV({ ...v, type: e.target.value })} />
        </Field>
        <Field label="Evidence Detail">
          <Input value={v.detail} onChange={(e) => setV({ ...v, detail: e.target.value })} />
        </Field>
      </Row>

      <Label>Steps for Confiscating Evidence</Label>
      {v.steps.map((s, i) => (
        <div key={i} className="flex items-start gap-3 mb-3">
          <Input
            value={s}
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
        onClick={addStep}
        className="h-10 px-4 rounded-md text-sm mt-2"
        style={{ border: `1px solid ${TOKENS.ring}`, color: TOKENS.text }}
      >
        + Add
      </button>

      <Field label="Notes">
        <Textarea value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} />
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
          />
        </Field>
        <Field label="Location">
          <Input value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} />
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
          <Input value={v.type} onChange={(e) => setV({ ...v, type: e.target.value })} />
        </Field>
        <Field label="Evidence Detail">
          <Input value={v.detail} onChange={(e) => setV({ ...v, detail: e.target.value })} />
        </Field>
      </Row>

      <div className="grid grid-cols-2 gap-3 mb-0 items-start">
        <Label>Investigation Hypothesis</Label>
        <Label>Tool Used</Label>
      </div>
      {v.pairs.map((p, i) => (
        <div key={i} className="grid grid-cols-2 gap-3 mb-3 items-start">
          <Input
            placeholder="Investigation Hypothesis"
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
        className="h-10 px-4 border rounded-md text-sm text-gray-200"
        style={{ borderColor: TOKENS.ring }}
      >
        + Add
      </button>

      <Field label="Notes">
        <Textarea value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} />
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

  const addFile = (file) => {
    const reader = new FileReader()
    reader.onload = () =>
      setV({ ...v, files: [...v.files, { name: file.name, base64: reader.result }] })
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
          />
        </Field>
        <Field label="Location">
          <Input value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} />
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
          <Input value={v.type} onChange={(e) => setV({ ...v, type: e.target.value })} />
        </Field>
        <Field label="Evidence Detail">
          <Input value={v.detail} onChange={(e) => setV({ ...v, detail: e.target.value })} />
        </Field>
      </Row>

      <Field label="Extraction Files">
        <label className="cursor-pointer h-11 px-5 rounded-md flex items-center justify-center border border-gray-500 w-fit text-sm text-gray-200">
          Upload File
          <input
            type="file"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && addFile(e.target.files[0])}
          />
        </label>
        <ul className="mt-3 space-y-1 text-sm text-gray-400">
          {v.files.map((f, i) => (
            <li key={i}>📄 {f.name}</li>
          ))}
        </ul>
      </Field>

      <Field label="Notes">
        <Textarea value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} />
      </Field>
    </>
  )
}

/* =============== ANALYSIS =============== */
function AnalysisPanel({ registerCollector, investigationTools }) {
  const { analysis, preparation, setStageData } = useEvidenceChain()

  const prepPairs =
    preparation?.pairs ??
    preparation?.hypothesis?.map((h, i) => ({
      investigation: h,
      tools: preparation.tool[i] ?? ''
    })) ??
    investigationTools.pairs ??
    []

  const [v, setV] = useState({
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
    summary: '',
    ...analysis
  })

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
          />
        </Field>
        <Field label="Location">
          <Input value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} />
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
          <Input value={v.type} onChange={(e) => setV({ ...v, type: e.target.value })} />
        </Field>
        <Field label="Evidence Detail">
          <Input value={v.detail} onChange={(e) => setV({ ...v, detail: e.target.value })} />
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
          className="mb-0"
        />
      ))}

      <Field label="Summary">
        <Textarea
          rows={3}
          value={v.summary}
          onChange={(e) => setV({ ...v, summary: e.target.value })}
        />
      </Field>
    </>
  )
}
