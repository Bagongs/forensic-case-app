/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { useEvidenceChain } from '../store/evidenceChain'

/* ======================= TOKENS ======================= */
const TOKENS = {
  modalBg: '#151D28',
  ring: '#394F6F',
  text: '#F4F6F8',
  dim: '#A8B3C4',
  gold: '#EDC702',
  goldAlpha: '#EDC702B2'
}

/* ======================= STAGES ======================= */
export const STAGES = {
  ACQUISITION: 'acquisition',
  PREPARATION: 'preparation',
  EXTRACTION: 'extraction',
  ANALYSIS: 'analysis'
}

/* ================== PRIMITIVE FIELDS ================== */
const Label = ({ children }) => (
  <div className="text-[14px] mb-2" style={{ color: TOKENS.dim }}>
    {children}
  </div>
)
const Input = (p) => (
  <input
    {...p}
    className={`w-full h-11 rounded-md bg-transparent px-3 text-[14px] outline-none ${p.className || ''}`}
    style={{ color: TOKENS.text, border: `1px solid ${TOKENS.ring}` }}
  />
)
const Select = ({ options = [], ...p }) => (
  <select
    {...p}
    className={`w-full h-11 rounded-md bg-transparent px-3 text-[14px] outline-none appearance-none ${p.className || ''}`}
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
    className={`w-full rounded-md bg-transparent px-3 py-2 text-[14px] outline-none resize-y ${p.className || ''}`}
    style={{ color: TOKENS.text, border: `1px solid ${TOKENS.ring}` }}
  />
)
const Field = ({ label, children, className }) => (
  <div className={className}>
    <Label>{label}</Label>
    {children}
  </div>
)
const Row = ({ children, cols = 2 }) => (
  <div
    className={`grid gap-4 sm:gap-5 ${cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}
  >
    {children}
  </div>
)

/* ======================= MAIN MODAL ======================= */
export default function StageContentModal({
  open,
  caseNumber = '32342223',
  caseTitle = 'Buronan Maroko Interpol',
  initialStage = STAGES.ACQUISITION,
  onClose,
  onSubmitStage
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
        [STAGES.ACQUISITION]: 'Acquisition',
        [STAGES.PREPARATION]: 'Preparation',
        [STAGES.EXTRACTION]: 'Extraction',
        [STAGES.ANALYSIS]: 'Analysis'
      })[stage] || 'Stage',
    [stage]
  )

  if (!open) return null

  async function handleFooterSubmit() {
    try {
      setSubmitting(true)
      const payload = (await collectorRef.current?.()) ?? {}
      await onSubmitStage?.(stage, payload)
      onClose?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,.6)' }}
        onClick={() => onClose?.()}
      />
      <div
        className="relative w-[min(920px,95vw)] max-h-[92vh] rounded-xl overflow-hidden flex flex-col"
        style={{ background: TOKENS.modalBg, boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-5 border-b" style={{ borderColor: TOKENS.ring }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[24px] font-semibold" style={{ color: TOKENS.text }}>
                {title}
              </div>
              <div className="mt-1 flex items-baseline gap-4">
                <div className="text-[28px] font-bold tracking-wide" style={{ color: TOKENS.gold }}>
                  {caseNumber}
                </div>
                <div className="text-[18px]" style={{ color: TOKENS.text }}>
                  {caseTitle}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg" aria-label="Close">
              <IoClose size={28} color={TOKENS.text} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6 overflow-auto space-y-6">
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
            <AnalysisPanel registerCollector={(fn) => (collectorRef.current = fn)} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 pb-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-11 px-6 rounded-md text-[14px]"
            style={{
              color: TOKENS.text,
              background: 'transparent',
              border: '1.5px solid #EDC702'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleFooterSubmit}
            disabled={submitting}
            className="h-11 px-6 rounded-md text-[14px]"
            style={{
              color: '#121212',
              background:
                'radial-gradient(50% 50% at 50% 50%, #EDC702 0%, rgba(237,199,2,0.7) 100%)',
              border: '3px solid #EDC702B2',
              opacity: submitting ? 0.7 : 1
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

/* ======================= PANELS ======================= */
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

  useEffect(() => {
    registerCollector?.(async () => {
      setStageData(STAGES.ACQUISITION, v)
      return v
    })
  }, [v, registerCollector, setStageData])

  const setStep = (i, val) => {
    const next = [...v.steps]
    next[i] = val
    setV({ ...v, steps: next })
  }
  const setPhoto = (i, file) => {
    const next = [...v.photos]
    next[i] = file
    setV({ ...v, photos: next })
  }
  const addStep = () => {
    setV({ ...v, steps: [...v.steps, ''], photos: [...v.photos, null] })
  }

  return (
    <>
      <Row>
        <Field label="Investigator">
          <Input
            placeholder="Name"
            value={v.investigator}
            onChange={(e) => setV({ ...v, investigator: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <Input
            placeholder="Location"
            value={v.location}
            onChange={(e) => setV({ ...v, location: e.target.value })}
          />
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
          <Input
            placeholder="Evidence Type"
            value={v.type}
            onChange={(e) => setV({ ...v, type: e.target.value })}
          />
        </Field>
        <Field label="Evidence Detail">
          <Input
            placeholder="Evidence Detail"
            value={v.detail}
            onChange={(e) => setV({ ...v, detail: e.target.value })}
          />
        </Field>
      </Row>

      <div className="mt-5">
        <Label>Steps for Confiscating Evidence</Label>

        {v.steps.map((s, i) => (
          <div key={i} className="flex items-start gap-3 mb-3">
            <Textarea
              rows={2}
              placeholder={`${i + 1}.`}
              value={s}
              onChange={(e) => setStep(i, e.target.value)}
              className="flex-1"
            />

            <label
              className="cursor-pointer h-11 px-5 rounded-md flex items-center justify-center"
              style={{
                background: '#394F6F',
                color: '#F4F6F8',
                border: '1px solid #394F6F',
                whiteSpace: 'nowrap'
              }}
            >
              Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setPhoto(i, e.target.files[0])
                }}
              />
            </label>
          </div>
        ))}

        <div className="mt-4">
          <button
            onClick={addStep}
            className="h-11 px-6 rounded-md text-[14px]"
            style={{
              color: '#F4F6F8',
              border: '1px solid #394F6F',
              background: 'transparent'
            }}
          >
            + Add
          </button>
        </div>
      </div>

      <Field label="Notes" className="mt-5">
        <Textarea
          placeholder="Evidence notes"
          rows={3}
          value={v.notes}
          onChange={(e) => setV({ ...v, notes: e.target.value })}
        />
      </Field>
    </>
  )
}

function PreparationPanel({ onPrev, registerCollector }) {
  const { preparation, setStageData } = useEvidenceChain()
  const [v, setV] = useState({
    investigator: '',
    location: '',
    source: '',
    type: '',
    detail: '',
    hypothesis: preparation.hypothesis?.length ? preparation.hypothesis : [''],
    tool: '',
    notes: '',
    ...preparation
  })
  useEffect(() => {
    registerCollector?.(async () => {
      setStageData(STAGES.PREPARATION, v)
      return v
    })
  }, [v, registerCollector, setStageData])

  const setHyp = (i, val) => {
    const next = [...v.hypothesis]
    next[i] = val
    setV({ ...v, hypothesis: next })
  }

  return (
    <>
      <Row>
        <Field label="Investigator">
          <Input
            placeholder="Name"
            value={v.investigator}
            onChange={(e) => setV({ ...v, investigator: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <Input
            placeholder="Location"
            value={v.location}
            onChange={(e) => setV({ ...v, location: e.target.value })}
          />
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
          <Input
            placeholder="Name"
            value={v.type}
            onChange={(e) => setV({ ...v, type: e.target.value })}
          />
        </Field>
        <Field label="Evidence Detail">
          <Input
            placeholder="Nomor HP"
            value={v.detail}
            onChange={(e) => setV({ ...v, detail: e.target.value })}
          />
        </Field>
      </Row>
      <Row>
        <Field label="Investigation Hypotesis">
          <div className="space-y-3">
            {v.hypothesis.map((h, i) => (
              <Textarea
                key={i}
                rows={2}
                placeholder={`${i + 1}.`}
                value={h}
                onChange={(e) => setHyp(i, e.target.value)}
              />
            ))}
            <button
              onClick={() => setV({ ...v, hypothesis: [...v.hypothesis, ''] })}
              className="h-[42px] px-5 rounded-md"
              style={{ color: TOKENS.text, border: `1px solid ${TOKENS.ring}` }}
            >
              + Add
            </button>
          </div>
        </Field>
        <Field label="Tool Used">
          <Select
            value={v.tool}
            onChange={(e) => setV({ ...v, tool: e.target.value })}
            options={['Select tools', 'Magnet Axiom', 'Cellebrite', 'Oxygen']}
          />
        </Field>
      </Row>
      <Field label="Notes">
        <Textarea
          placeholder="Evidence notes"
          rows={3}
          value={v.notes}
          onChange={(e) => setV({ ...v, notes: e.target.value })}
        />
      </Field>
    </>
  )
}

function ExtractionPanel({ onPrev, registerCollector }) {
  const { extraction, setStageData } = useEvidenceChain()
  const [v, setV] = useState({
    investigator: '',
    location: '',
    source: '',
    type: '',
    detail: '',
    results: '',
    notes: '',
    ...extraction
  })
  useEffect(() => {
    registerCollector?.(async () => {
      setStageData(STAGES.EXTRACTION, v)
      return v
    })
  }, [v, registerCollector, setStageData])

  return (
    <>
      <Row>
        <Field label="Investigator">
          <Input
            placeholder="Name"
            value={v.investigator}
            onChange={(e) => setV({ ...v, investigator: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <Input
            placeholder="Location"
            value={v.location}
            onChange={(e) => setV({ ...v, location: e.target.value })}
          />
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
          <Input
            placeholder="Name"
            value={v.type}
            onChange={(e) => setV({ ...v, type: e.target.value })}
          />
        </Field>
        <Field label="Evidance Detail">
          <Input
            placeholder="Detail"
            value={v.detail}
            onChange={(e) => setV({ ...v, detail: e.target.value })}
          />
        </Field>
      </Row>
      <Field label="Extraction Results">
        <Textarea
          rows={5}
          value={v.results}
          onChange={(e) => setV({ ...v, results: e.target.value })}
        />
      </Field>
      <Field label="Notes">
        <Textarea
          rows={3}
          value={v.notes}
          onChange={(e) => setV({ ...v, notes: e.target.value })}
        />
      </Field>
    </>
  )
}

function AnalysisPanel({ onPrev, registerCollector }) {
  const { analysis, preparation, setStageData } = useEvidenceChain()

  // Prefill hypotheses dari Preparation jika Analysis masih kosong
  const initial = (() => {
    const base = {
      investigator: '',
      location: '',
      source: '',
      type: '',
      detail: '',
      analystName: '',
      hypotheses: ['', '', ''],
      tools: ['Magnet Axiom', 'Cellebrite', 'Oxygen'],
      results: ['', '', ''],
      summary: '',
      ...analysis
    }
    const fromPrep = Array.isArray(preparation?.hypothesis) ? preparation.hypothesis : []
    const isEmpty = (arr) => !arr || arr.every((s) => !String(s || '').trim())
    if (fromPrep.length && isEmpty(base.hypotheses)) base.hypotheses = [...fromPrep]
    return base
  })()

  const [v, setV] = useState(initial)
  const setArr = (key, i, val) => {
    const next = [...v[key]]
    next[i] = val
    setV({ ...v, [key]: next })
  }

  useEffect(() => {
    registerCollector?.(async () => {
      setStageData(STAGES.ANALYSIS, v)
      return v
    })
  }, [v, registerCollector, setStageData])

  return (
    <>
      <Row>
        <Field label="Investigator">
          <Input
            placeholder="Name"
            value={v.investigator}
            onChange={(e) => setV({ ...v, investigator: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <Input
            placeholder="Location"
            value={v.location}
            onChange={(e) => setV({ ...v, location: e.target.value })}
          />
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
          <Input
            placeholder="Name"
            value={v.type}
            onChange={(e) => setV({ ...v, type: e.target.value })}
          />
        </Field>
        <Field label="Evidence Detail">
          <Input
            placeholder="Nomor HP"
            value={v.detail}
            onChange={(e) => setV({ ...v, detail: e.target.value })}
          />
        </Field>
      </Row>

      <Field label="Investigator">
        <Input
          placeholder="Solehun"
          value={v.analystName}
          onChange={(e) => setV({ ...v, analystName: e.target.value })}
        />
      </Field>

      <Row>
        <Field label="Investigation Hypotesis">
          <div className="space-y-3">
            {v.hypotheses.map((h, i) => (
              <Textarea
                key={i}
                rows={2}
                placeholder={`${i + 1}.`}
                value={h}
                onChange={(e) => setArr('hypotheses', i, e.target.value)}
              />
            ))}
          </div>
        </Field>
        <Field label="Tool Used">
          <div className="space-y-3">
            {v.tools.map((t, i) => (
              <Input key={i} value={t} onChange={(e) => setArr('tools', i, e.target.value)} />
            ))}
          </div>
        </Field>
      </Row>

      <Field label="Analysis Result">
        <div className="space-y-3">
          {v.results.map((r, i) => (
            <Textarea
              key={i}
              rows={2}
              placeholder={`${i + 1}.`}
              value={r}
              onChange={(e) => setArr('results', i, e.target.value)}
            />
          ))}
        </div>
      </Field>

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
