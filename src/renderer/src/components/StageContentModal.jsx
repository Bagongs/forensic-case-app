/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { useEvidenceChain } from '../store/evidenceChain'
import { useCases } from '../store/cases'
import SummaryBox from './SummaryBox'

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
    {options.map((o) => (
      <option
        key={o.value ?? o}
        value={o.value ?? o}
        style={{ background: '#0F1621', color: TOKENS.text }}
      >
        {o.label ?? o}
      </option>
    ))}
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
  evidenceId,
  onClose,
  onSubmitStage
}) {
  const [stage, setStage] = useState(initialStage)
  const [submitting, setSubmitting] = useState(false)
  const collectorRef = useRef(null)
  const { addChainContent } = useCases()
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
    try {
      setSubmitting(true)
      const payload = (await collectorRef.current?.()) ?? {}
      await onSubmitStage?.(stage, payload)
      if (evidenceId) addChainContent(evidenceId, stage, payload)
      onClose?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
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
              registerCollector={(fn) => (collectorRef.current = fn)}
              preparationData={preparation}
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
    detail: '',
    steps: [''],
    photos: [null],
    notes: '',
    ...acquisition
  })

  const addStep = () => setV({ ...v, steps: [...v.steps, ''], photos: [...v.photos, null] })

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
      const payload = {
        ...v,
        id: crypto.randomUUID(),
        // type: STAGES.ACQUISITION,
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
            options={['Select Source', 'Handphone', 'Laptop', 'Cloud']}
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
          <Textarea
            rows={2}
            value={s}
            onChange={(e) => {
              const next = [...v.steps]
              next[i] = e.target.value
              setV({ ...v, steps: next })
            }}
          />
          <label className="cursor-pointer px-4 py-2 border border-gray-500 rounded-md">
            Upload Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && setPhoto(i, e.target.files[0])}
            />
          </label>
        </div>
      ))}
      <button
        onClick={addStep}
        className="h-10 px-4 border border-gray-500 rounded-md text-sm text-gray-200 mt-2"
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
        // type: STAGES.PREPARATION,
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
            options={['Select source', 'Handphone', 'Laptop', 'Cloud']}
          />
        </Field>
        <Field label="Evidence Type">
          <Input value={v.type} onChange={(e) => setV({ ...v, type: e.target.value })} />
        </Field>
        <Field label="Evidence Detail">
          <Input value={v.detail} onChange={(e) => setV({ ...v, detail: e.target.value })} />
        </Field>
      </Row>

      <Label>Investigation Hypothesis & Tools Used</Label>
      {v.pairs.map((p, i) => (
        <div key={i} className="grid grid-cols-2 gap-3 mb-3 items-start">
          <Textarea
            placeholder="Investigation Hypothesis"
            value={p.investigation}
            onChange={(e) => setPair(i, 'investigation', e.target.value)}
          />
          <div>
            <Label>Tool Used</Label>
            <Select
              value={p.tools}
              onChange={(e) => setPair(i, 'tools', e.target.value)}
              options={['Select tools', 'Magnet Axiom', 'Oxygen', 'Cellebrite', 'Encase']}
            />
          </div>
        </div>
      ))}

      <button
        onClick={addPair}
        className="h-10 px-4 border border-gray-500 rounded-md text-sm text-gray-200"
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
        // type: STAGES.EXTRACTION,
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
            options={['Select source', 'Handphone', 'Laptop', 'Cloud']}
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
            accept="*"
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
function AnalysisPanel({ registerCollector, preparationData }) {
  const { analysis, setStageData } = useEvidenceChain()
  const prepPairs =
    preparationData?.pairs ??
    preparationData?.hypothesis?.map((h, i) => ({
      investigation: h,
      tools: preparationData.tool[i] ?? ''
    })) ??
    []

  const [v, setV] = useState({
    investigator: '',
    location: '',
    source: '',
    type: '',
    detail: '',
    analystName: '',
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
        // type: STAGES.ANALYSIS,
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
            options={['Handphone', 'Laptop', 'Cloud']}
          />
        </Field>
        <Field label="Evidence Type">
          <Input value={v.type} onChange={(e) => setV({ ...v, type: e.target.value })} />
        </Field>
        <Field label="Evidence Detail">
          <Input value={v.detail} onChange={(e) => setV({ ...v, detail: e.target.value })} />
        </Field>
      </Row>

      {/* <Field label="Analyst Name">
        <Input
          value={v.analystName}
          onChange={(e) => setV({ ...v, analystName: e.target.value })}
        />
      </Field> */}

      {/* Investigation Hypothesis & Tool Used */}
      <div className="flex flex-row gap-5 w-full">
        <div className="flex flex-col gap-2 w-full">
          <Label>Investigation Hypotesis</Label>
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

      {/* Analysis Result */}
      <Label>Analysis Result</Label>
      {v.analysisPairs.map((p, i) => (
        <Textarea
          key={i}
          rows={2}
          placeholder={`${i + 1}.`}
          value={p.result}
          onChange={(e) => setResult(i, e.target.value)}
          className="mb-3"
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
