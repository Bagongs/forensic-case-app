/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'

const DEV_TYPES = ['HP', 'SSD', 'HardDisk', 'PC', 'Laptop', 'DVR']

export default function StageContentModal({ open, stage, onClose, onSubmit, evidenceId }) {
  // header umum
  const [location, setLocation] = useState('')
  const [investigator, setInvestigator] = useState('')
  const [devType, setDevType] = useState('HP')
  const [itemType, setItemType] = useState('') // jenis barang bukti
  const [itemDetail, setItemDetail] = useState('') // detail barang bukti
  const [officerNote, setOfficerNote] = useState('')

  // acquisition
  const [steps, setSteps] = useState([{ desc: '', previewDataUrl: null }])

  // preparation
  const [hypothesis, setHypothesis] = useState([''])
  const [tools, setTools] = useState('HP')

  // extraction
  const [extFile, setExtFile] = useState(null) // {name,size,mime,previewDataUrl}

  // analysis
  const [expectations, setExpectations] = useState([''])
  const [result, setResult] = useState('')
  const [report, setReport] = useState(null) // {name,size,mime,previewDataUrl}
  const [conclusion, setConclusion] = useState('')

  const fileRefs = useRef({})

  useEffect(() => {
    if (!open) reset()
  }, [open, stage])

  function reset() {
    setLocation('')
    setInvestigator('')
    setDevType('HP')
    setItemType('')
    setItemDetail('')
    setOfficerNote('')
    setSteps([{ desc: '', previewDataUrl: null }])
    setHypothesis([''])
    setTools('HP')
    setExtFile(null)
    setExpectations([''])
    setResult('')
    setReport(null)
    setConclusion('')
  }

  const fileToDataURL = (f) =>
    new Promise((res, rej) => {
      const r = new FileReader()
      r.onerror = rej
      r.onload = () => res(String(r.result))
      r.readAsDataURL(f)
    })

  async function pickImageForStep(idx, e) {
    const f = e.target.files?.[0]
    if (!f) return
    const data = f.type?.startsWith('image/') ? await fileToDataURL(f) : null
    setSteps((s) => s.map((it, i) => (i === idx ? { ...it, previewDataUrl: data } : it)))
  }

  async function pickSingleFile(setter, e) {
    const f = e.target.files?.[0]
    if (!f) return setter(null)
    const data = f.type?.startsWith('image/') ? await fileToDataURL(f) : null
    setter({ name: f.name, size: f.size, mime: f.type, previewDataUrl: data })
  }

  const header = { location, investigator, devType, itemType, itemDetail, officerNote }

  const canSubmit = (() => {
    if (stage === 'acquisition') return steps.some((s) => s.desc.trim())
    if (stage === 'preparation') return hypothesis.some((h) => h.trim())
    if (stage === 'extraction') return !!extFile
    if (stage === 'analysis') return result.trim() || report || conclusion.trim()
    return false
  })()

  function handleSubmit() {
    if (!canSubmit) return

    if (stage === 'acquisition') {
      onSubmit({
        type: 'acquisition',
        title: header.itemType ? `Penyitaan ${header.itemType}` : 'Penyitaan',
        header,
        steps: steps
          .filter((s) => s.desc.trim() || s.previewDataUrl)
          .map((s, i) => ({ no: i + 1, desc: s.desc.trim(), previewDataUrl: s.previewDataUrl }))
      })
    }

    if (stage === 'preparation') {
      onSubmit({
        type: 'preparation',
        title: 'Preparation',
        header,
        hypothesis: hypothesis.filter(Boolean).map((h) => h.trim()),
        tools
      })
    }

    if (stage === 'extraction') {
      onSubmit({
        type: 'extraction',
        title: 'Extraction result',
        header,
        file: extFile
      })
    }

    if (stage === 'analysis') {
      onSubmit({
        type: 'analysis',
        title: 'Analysis',
        header,
        expectations: expectations.filter(Boolean).map((e) => e.trim()),
        result: result.trim(),
        report,
        conclusion: conclusion.trim()
      })
    }
    onClose()
    reset()
  }

  return (
    <Modal
      open={open}
      title={`Add content – ${capitalize(stage)}`}
      onCancel={onClose}
      onConfirm={handleSubmit}
      confirmText="Save"
      disableConfirm={!canSubmit}
      size="lg"
    >
      <div className="grid gap-4">
        {/* Header umum */}
        <Row label="Lokasi">
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="name"
          />
        </Row>
        <Row label="Penyidik">
          <Input
            value={investigator}
            onChange={(e) => setInvestigator(e.target.value)}
            placeholder="name"
          />
        </Row>

        <div className="grid grid-cols-3 gap-3">
          <Row label="Tipe barang bukti">
            <Select value={devType} onChange={(e) => setDevType(e.target.value)}>
              {DEV_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Row>
          <Row label="Jenis barang bukti">
            <Input
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              placeholder="name"
            />
          </Row>
          <Row label="Detail barang bukti">
            <Input
              value={itemDetail}
              onChange={(e) => setItemDetail(e.target.value)}
              placeholder="nomor hp, dsb"
            />
          </Row>
        </div>

        {stage === 'acquisition' && (
          <>
            <Label>Langkah penyitaan barang bukti</Label>
            {steps.map((s, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <Textarea
                  rows={3}
                  value={s.desc}
                  onChange={(e) =>
                    setSteps((arr) =>
                      arr.map((it, idx) => (idx === i ? { ...it, desc: e.target.value } : it))
                    )
                  }
                  placeholder="Case Description"
                />
                <div
                  className="rounded-lg border grid place-items-center p-3"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <button
                    className="px-4 py-1.5 rounded-lg border text-sm hover:bg-white/10"
                    style={{ borderColor: 'var(--border)' }}
                    onClick={() => fileRefs.current[`acq-${i}`]?.click()}
                  >
                    upload
                  </button>
                  <input
                    type="file"
                    ref={(el) => (fileRefs.current[`acq-${i}`] = el)}
                    className="hidden"
                    onChange={(e) => pickImageForStep(i, e)}
                  />
                  {s.previewDataUrl && (
                    <img src={s.previewDataUrl} alt="preview" className="max-h-24 mt-2 rounded" />
                  )}
                </div>
              </div>
            ))}
            <div>
              <button
                className="px-4 py-1.5 rounded-lg border text-sm hover:bg-white/10"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => setSteps((s) => [...s, { desc: '', previewDataUrl: null }])}
              >
                Tambah
              </button>
            </div>
            <Row label="Catatan penyidik">
              <Textarea
                rows={3}
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                placeholder="Case Description"
              />
            </Row>
          </>
        )}

        {stage === 'preparation' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Row label="Hipotesis Penyelidikan">
                <Textarea
                  rows={3}
                  value={hypothesis[0]}
                  onChange={(e) => setHypothesis([e.target.value])}
                  placeholder="Case Description"
                />
              </Row>
              <Row label="Tools yang digunakan">
                <Select value={tools} onChange={(e) => setTools(e.target.value)}>
                  {DEV_TYPES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Row>
            </div>
            <Row label="Catatan penyidik">
              <Textarea
                rows={3}
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                placeholder="Case Description"
              />
            </Row>
          </>
        )}

        {stage === 'extraction' && (
          <>
            <Row label="Hasil ekstraksi">
              <div
                className="rounded-lg border p-4 grid place-items-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  className="px-4 py-1.5 rounded-lg border text-sm hover:bg-white/10"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => fileRefs.current.ext?.click()}
                >
                  upload
                </button>
                <input
                  type="file"
                  ref={(el) => (fileRefs.current.ext = el)}
                  className="hidden"
                  onChange={(e) => pickSingleFile(setExtFile, e)}
                />
                {extFile?.previewDataUrl && (
                  <img
                    src={extFile.previewDataUrl}
                    alt="preview"
                    className="max-h-32 mt-2 rounded"
                  />
                )}
              </div>
            </Row>
            <Row label="Catatan penyidik">
              <Textarea
                rows={3}
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                placeholder="Case Description"
              />
            </Row>
          </>
        )}

        {stage === 'analysis' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Row label="Ekspektasi analisa">
                <Textarea
                  rows={3}
                  value={expectations[0]}
                  onChange={(e) => setExpectations([e.target.value])}
                  placeholder="Case Description"
                />
              </Row>
              <Row label="Hasil analisa">
                <Textarea
                  rows={3}
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="Case Description"
                />
              </Row>
            </div>
            <Row label="Upload Report">
              <div
                className="rounded-lg border p-4 grid place-items-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  className="px-4 py-1.5 rounded-lg border text-sm hover:bg-white/10"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => fileRefs.current.report?.click()}
                >
                  upload
                </button>
                <input
                  type="file"
                  ref={(el) => (fileRefs.current.report = el)}
                  className="hidden"
                  onChange={(e) => pickSingleFile(setReport, e)}
                />
                {report?.previewDataUrl && (
                  <img
                    src={report.previewDataUrl}
                    alt="preview"
                    className="max-h-32 mt-2 rounded"
                  />
                )}
              </div>
            </Row>
            <Row label="Kesimpulan">
              <Textarea
                rows={3}
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Case Description"
              />
            </Row>
          </>
        )}
      </div>
    </Modal>
  )
}

/* ——— tiny atoms ——— */
function Row({ label, children }) {
  return (
    <div className="grid gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
function Label({ children }) {
  return (
    <div className="text-xs font-semibold" style={{ color: 'var(--dim)' }}>
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
      className="w-full px-3 py-2 rounded-lg border bg-transparent"
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
const capitalize = (s) => s?.charAt(0).toUpperCase() + s?.slice(1)
