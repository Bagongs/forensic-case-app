/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react'
import { FaFilePdf } from 'react-icons/fa6'
import { FaTrash } from 'react-icons/fa'
import { useEvidenceChain } from '../../../store/evidenceChain'
import Modal from '../Modal'
import { useAuth } from '../../../store/auth'

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
    className={`w-full h-11 rounded-md bg-transparent px-3 text-sm outline-none ${
      p.className || ''
    }`}
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
    className={`grid gap-4 ${
      cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
    }`}
  >
    {children}
  </div>
)

/* =============== MAIN MODAL WRAPPER =============== */
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
  const [isValid, setIsValid] = useState(false) // validasi per stage
  const [resetSignal, setResetSignal] = useState(0) // trigger reset v di panel
  const collectorRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    if (open) {
      setStage(initialStage)
      setIsValid(false)
    }
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
    if (!isValid) return // safety kalau somehow kepencet
    setSubmitting(true)
    try {
      const payload = (await collectorRef.current?.()) ?? {}
      await onSubmitStage?.(stage, payload)

      // selesai submit (sukses) → reset state panel
      setResetSignal((x) => x + 1)
      onClose?.()
    } catch (err) {
      console.error('Submit stage error:', err)
      // error juga tetap reset biar state v gak "nyangkut"
      setResetSignal((x) => x + 1)
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
      disableConfirm={submitting || !isValid} // kunci tombol di sini
    >
      <div className="space-y-6">
        {stage === STAGES.ACQUISITION && (
          <AcquisitionPanel
            user={user}
            resetSignal={resetSignal}
            registerCollector={(fn) => (collectorRef.current = fn)}
            onValidityChange={setIsValid}
          />
        )}

        {stage === STAGES.PREPARATION && (
          <PreparationPanel
            user={user}
            resetSignal={resetSignal}
            registerCollector={(fn) => (collectorRef.current = fn)}
            onValidityChange={setIsValid}
          />
        )}

        {stage === STAGES.EXTRACTION && (
          <ExtractionPanel
            user={user}
            resetSignal={resetSignal}
            registerCollector={(fn) => (collectorRef.current = fn)}
            onValidityChange={setIsValid}
          />
        )}

        {stage === STAGES.ANALYSIS && (
          <AnalysisPanel
            user={user}
            open={open}
            resetSignal={resetSignal}
            investigationTools={investigationTools}
            registerCollector={(fn) => (collectorRef.current = fn)}
            onValidityChange={setIsValid}
          />
        )}
      </div>
    </Modal>
  )
}

/* =============== ACQUISITION =============== */
function AcquisitionPanel({ user, registerCollector, onValidityChange, resetSignal }) {
  const { acquisition, setStageData } = useEvidenceChain()

  const buildInitial = () => {
    const base = {
      investigator: '',
      location: '',
      source: 'Hp',
      type: '',
      detail: '',
      steps: [''],
      photos: [null],
      notes: ''
    }

    if (!acquisition) return base

    const next = { ...base, ...acquisition }

    if (Array.isArray(acquisition.steps) && acquisition.steps.length > 0) {
      const first = acquisition.steps[0]

      if (typeof first === 'string') {
        // versi lama
        next.steps = acquisition.steps
        if (
          Array.isArray(acquisition.photos) &&
          acquisition.photos.length === acquisition.steps.length
        ) {
          next.photos = acquisition.photos
        } else {
          next.photos = acquisition.steps.map(() => null)
        }
      } else {
        // versi baru [{ no, desc, previewDataUrl }]
        next.steps = acquisition.steps.map((s) => s?.desc ?? '')
        next.photos = acquisition.steps.map((s) => s?.previewDataUrl ?? null)
      }
    }

    if (!next.steps || next.steps.length === 0) next.steps = ['']
    if (!next.photos || next.photos.length !== next.steps.length) {
      next.photos = next.steps.map((_, i) => next.photos?.[i] ?? null)
    }

    return next
  }

  const [v, setV] = useState(buildInitial)

  // sync kalau store acquisition berubah (evidence lain)
  useEffect(() => {
    setV(buildInitial())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acquisition])

  // reset lokal state setelah submit (sukses / error)
  useEffect(() => {
    if (!resetSignal) return
    setV(buildInitial())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  // upload photo
  const setPhoto = (i, file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const photos = [...v.photos]
      photos[i] = reader.result
      setV({ ...v, photos })
    }
    reader.readAsDataURL(file)
  }

  const deleteStep = (i) => {
    if (v.steps.length === 1) return
    const steps = [...v.steps]
    const photos = [...v.photos]
    steps.splice(i, 1)
    photos.splice(i, 1)
    setV({ ...v, steps, photos })
  }

  // untuk tombol + Add Step
  const lastStepComplete = () => {
    const lastText = v.steps[v.steps.length - 1]
    const lastPhoto = v.photos[v.photos.length - 1]
    return lastText.trim() !== '' && lastPhoto !== null
  }

  // VALIDATION: step text + photo wajib diisi semua
  useEffect(() => {
    const hasAtLeastOneStep = v.steps.length > 0
    const allTextFilled = v.steps.every((s) => s.trim() !== '')
    const allPhotosFilled = v.photos.every((p) => p !== null)
    const valid = hasAtLeastOneStep && allTextFilled && allPhotosFilled
    onValidityChange?.(valid)
  }, [v.steps, v.photos, onValidityChange])

  // collector
  useEffect(() => {
    registerCollector(async () => {
      const stepsObj = v.steps.map((desc, i) => ({
        no: i + 1,
        desc,
        previewDataUrl: v.photos[i]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v])

  return (
    <>
      <Row>
        <Field label="Investigator">
          <Input value={user.fullname} readOnly />
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
            data-optional="false"
            placeholder={`${i + 1}.`}
            onChange={(e) => {
              const steps = [...v.steps]
              steps[i] = e.target.value
              setV({ ...v, steps })
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
                className="cursor-pointer px-3 py-3 border rounded-sm text-sm"
                style={{ backgroundColor: '#394F6F', border: 'none' }}
              >
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  data-optional="true"
                  data-key={`step-${i}`}
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
                data-optional="true"
                data-key={`step-${i}`}
                onChange={(e) => e.target.files?.[0] && setPhoto(i, e.target.files[0])}
              />
            </label>
          )}

          {v.steps.length > 1 && (
            <button
              type="button"
              onClick={() => deleteStep(i)}
              className="mt-2 text-red-400 text-lg"
              title="Delete Step"
            >
              <FaTrash />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={() =>
          lastStepComplete() &&
          setV({
            ...v,
            steps: [...v.steps, ''],
            photos: [...v.photos, null]
          })
        }
        disabled={!lastStepComplete()}
        className="h-10 px-4 rounded-md text-sm mt-2 bg-[#394F6F] disabled:opacity-40"
        style={{ border: `1px solid ${TOKENS.ring}`, color: TOKENS.text }}
      >
        + Add Step
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
function PreparationPanel({ user, registerCollector, onValidityChange, resetSignal }) {
  const { preparation, setStageData } = useEvidenceChain()

  const buildInitial = () => ({
    investigator: '',
    location: '',
    source: 'Hp',
    type: '',
    stage: '',
    detail: '',
    pairs: [{ investigation: '', tools: '' }],
    notes: '',
    ...preparation
  })

  const [v, setV] = useState(buildInitial)

  useEffect(() => {
    setV(buildInitial())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preparation, resetSignal])

  const addPair = () =>
    setV((prev) => ({
      ...prev,
      pairs: [...prev.pairs, { investigation: '', tools: '' }]
    }))

  const deletePair = (i) => {
    if (v.pairs.length === 1) return
    const next = [...v.pairs]
    next.splice(i, 1)
    setV({ ...v, pairs: next })
  }

  const setPair = (i, key, val) => {
    const next = [...v.pairs]
    next[i][key] = val
    setV({ ...v, pairs: next })
  }

  const lastPairComplete = () => {
    const last = v.pairs[v.pairs.length - 1]
    return last.investigation.trim() !== '' && last.tools.trim() !== ''
  }

  // VALIDATION: investigation & tools wajib isi semuanya
  useEffect(() => {
    const hasAtLeastOne = v.pairs.length > 0
    const allInvestigationFilled = v.pairs.every((p) => p.investigation.trim() !== '')
    const allToolsFilled = v.pairs.every((p) => p.tools.trim() !== '')
    onValidityChange?.(hasAtLeastOne && allInvestigationFilled && allToolsFilled)
  }, [v.pairs, onValidityChange])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v])

  return (
    <>
      <Row>
        <Field label="Investigator">
          <Input
            value={user.fullname}
            onChange={() => setV({ ...v, investigator: user.fullname })}
            placeholder="Name"
            readOnly
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
          <div className="flex items-start gap-2">
            <Input
              placeholder={`${i + 1}.`}
              value={p.investigation}
              onChange={(e) => setPair(i, 'investigation', e.target.value)}
              data-optional="false"
            />
          </div>
          <div className="flex gap-3">
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
            {v.pairs.length > 1 && (
              <button
                type="button"
                onClick={() => deletePair(i)}
                className="mt-2 text-red-400 text-lg"
                title="Delete Row"
              >
                <FaTrash />
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={() => lastPairComplete() && addPair()}
        disabled={!lastPairComplete()}
        className="h-10 px-4 border rounded-md text-sm bg-[#394F6F] text-gray-200 disabled:opacity-40"
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
function ExtractionPanel({ user, registerCollector, onValidityChange, resetSignal }) {
  const { extraction, setStageData } = useEvidenceChain()

  const buildInitial = () => ({
    investigator: '',
    location: '',
    source: 'Hp',
    type: '',
    stage: '',
    detail: '',
    files: [],
    notes: '',
    ...extraction
  })

  const [v, setV] = useState(buildInitial)

  useEffect(() => {
    setV(buildInitial())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraction, resetSignal])

  const approxSizeLabel = (base64) => {
    if (!base64) return '-'
    const sizeInBytes = Math.ceil((base64.length * 3) / 4) - 2
    if (sizeInBytes < 1024) return `${sizeInBytes} B`
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
    return `${(sizeInBytes / 1024 / 1024).toFixed(2)} MB`
  }

  const addFile = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result
      const sizeLabel = approxSizeLabel(base64)
      setV((prev) => ({
        ...prev,
        files: [
          {
            name: file.name,
            mime: file.type,
            size: sizeLabel,
            base64
          }
        ]
      }))
    }
    reader.readAsDataURL(file)
  }

  // VALIDATION: minimal 1 file
  useEffect(() => {
    onValidityChange?.(v.files.length > 0)
  }, [v.files, onValidityChange])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v])

  return (
    <>
      <Row>
        <Field label="Investigator">
          <Input
            value={user.fullname}
            onChange={() => setV({ ...v, investigator: user.fullname })}
            placeholder="Name"
            readOnly
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
              data-optional={v.files.length > 0 ? 'true' : 'false'}
              data-key="extraction-upload"
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

/* =============== ANALYSIS =============== */
function AnalysisPanel({
  user,
  open,
  registerCollector,
  investigationTools,
  onValidityChange,
  resetSignal
}) {
  const { preparation, setStageData } = useEvidenceChain()

  const prepPairs =
    preparation?.pairs ??
    preparation?.hypothesis?.map((h, i) => ({
      investigation: h,
      tools: preparation.tool?.[i] ?? ''
    })) ??
    investigationTools[0]?.pairs ??
    []

  const buildDefaults = () => ({
    investigator: '',
    location: '',
    source: 'Hp',
    type: '',
    detail: '',
    notes: '',
    analysisPairs: prepPairs.map((p) => ({
      investigation: p.investigation || '',
      tools: p.tools || '',
      result: ''
    })),
    reports: []
  })

  const [v, setV] = useState(buildDefaults)

  useEffect(() => {
    if (open) {
      setV(buildDefaults())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preparation, resetSignal])

  // VALIDATION: required hanya:
  // - Analysis Result (semua)
  // - Location
  // - Evidence Source
  // - Evidence Type
  // - Evidence Detail
  useEffect(() => {
    const allResultFilled = v.analysisPairs.every((p) => p.result.trim() !== '')
    const locationOK = v.location.trim() !== ''
    const sourceOK = v.source.trim() !== ''
    const typeOK = v.type.trim() !== ''
    const detailOK = v.detail.trim() !== ''

    const valid = allResultFilled && locationOK && sourceOK && typeOK && detailOK

    onValidityChange?.(valid)
  }, [v, onValidityChange])

  const addReports = async (fileList) => {
    const arr = Array.from(fileList)

    const files = await Promise.all(
      arr.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                base64: reader.result,
                file
              })
            }
            reader.readAsDataURL(file)
          })
      )
    )

    setV((prev) => ({
      ...prev,
      reports: [...prev.reports, ...files]
    }))
  }

  const setResult = (i, val) => {
    const next = [...v.analysisPairs]
    next[i].result = val
    setV({ ...v, analysisPairs: next })
  }

  useEffect(() => {
    registerCollector(async () => {
      const payload = {
        ...v,
        stage: STAGES.ANALYSIS,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        hypothesis: v.analysisPairs.map((p) => p.investigation),
        tools: v.analysisPairs.map((p) => p.tools),
        result: v.analysisPairs.map((p) => p.result),
        reports: v.reports
      }

      setStageData(STAGES.ANALYSIS, payload)
      return payload
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v])

  return (
    <>
      <Row>
        <Field label="Investigator">
          <Input
            value={user.fullname}
            onChange={() => setV({ ...v, investigator: user.fullname })}
            placeholder="Name"
            readOnly
          />
        </Field>

        <Field label="Location">
          <Input
            value={v.location}
            onChange={(e) => setV({ ...v, location: e.target.value })}
            placeholder="Location"
            data-optional="false"
          />
        </Field>
      </Row>

      <Row cols={3}>
        <Field label="Evidence Source">
          <Select
            value={v.source}
            onChange={(e) => setV({ ...v, source: e.target.value })}
            options={DEVICE_SOURCES}
            data-optional="false"
          />
        </Field>

        <Field label="Evidence Type">
          <Input
            value={v.type}
            onChange={(e) => setV({ ...v, type: e.target.value })}
            placeholder="Evidence Type"
            data-optional="false"
          />
        </Field>

        <Field label="Evidence Detail">
          <Input
            value={v.detail}
            onChange={(e) => setV({ ...v, detail: e.target.value })}
            placeholder="Evidence Detail"
            data-optional="false"
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
          data-optional="false"
        />
      ))}

      <Field label={`Upload Report (${v.reports.length})`}>
        <div
          className="w-full rounded-md flex items-center justify-center"
          style={{ border: `1px solid ${TOKENS.ring}`, minHeight: 88 }}
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
              data-optional="true"
              onChange={(e) => {
                addReports(e.target.files)
                e.target.value = null
              }}
            />
          </label>
        </div>

        <div className="mt-3 space-y-3">
          {v.reports.map((f, i) => (
            <div
              key={i}
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
