/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/rules-of-hooks */
import { Fragment, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCases } from '../../store/cases'
import MiniButton from '../../components/MiniButton'
import StageContentModal from '../../components/StageContentModal'

const STAGES = [
  { key: 'acquisition', label: 'Acquisition' },
  { key: 'preparation', label: 'Preparation' },
  { key: 'extraction', label: 'Extraction' },
  { key: 'analysis', label: 'Analysis' }
]

// ====== Accent warna per stage ======
const STAGE_STYLE = {
  acquisition: { fill: '#04122F', border: '#2563EB' },
  preparation: { fill: '#312002', border: '#F59E0B' },
  extraction: { fill: '#321501', border: '#F97316' },
  analysis: { fill: '#062D14', border: '#16A34A' }
}
const NODE_DEFAULT = { fill: '#313131', border: '#888888' }

const fmtDateLong = (iso) =>
  iso
    ? new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    : ''
const fmtDateShort = fmtDateLong
const truncate = (s, n = 256) => (!s ? '' : s.length > n ? s.slice(0, n).trimEnd() + '…' : s)

export default function EvidenceDetailPage() {
  const { evidenceId } = useParams()
  const nav = useNavigate()
  const getEvidenceById = useCases((s) => s.getEvidenceById)
  const addChainContent = useCases((s) => s.addChainContent)

  const ref = getEvidenceById(evidenceId)
  if (!ref) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <button className="btn" onClick={() => nav(-1)}>
            ← Back
          </button>
        </div>
        <div className="text-sm opacity-70">Evidence not found.</div>
      </div>
    )
  }

  const { evidence, caseRef, personRef } = ref
  const [active, setActive] = useState(STAGES[0].key)
  const [modal, setModal] = useState(false)

  const chain = evidence.chain || { acquisition: [], preparation: [], extraction: [], analysis: [] }
  const contents = chain?.[active] ?? []
  const latest = contents.length > 0 ? contents[contents.length - 1] : null

  // meta kecil di heading (tanggal dibuat evidence)
  const headerMeta = useMemo(() => {
    const d = new Date(evidence.createdAt || Date.now())
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`
    return { date }
  }, [evidence.createdAt])

  function handleSubmitStage(item) {
    addChainContent(evidence.id, active, item)
  }

  // ===== panel header fields =====
  const panelLocation = latest?.header?.location || ''
  const panelDatetime = fmtDateLong(latest?.createdAt)
  const panelInvestigator = latest?.header?.investigator || ''

  const devicePieces = []
  if (latest?.header?.devType) devicePieces.push(latest.header.devType)
  const modelLike =
    latest?.header?.itemDetail || latest?.header?.devModel || latest?.header?.devName
  if (modelLike) devicePieces.push(`: ${modelLike}`)
  if (latest?.header?.phoneNumber) devicePieces.push(` ${latest.header.phoneNumber}`)
  const deviceLine = devicePieces.join('')

  // Notes prioritas dari modal (item.notes)
  const noteSource = latest?.notes || latest?.header?.officerNote || latest?.header?.note || ''
  const notePreview = truncate(noteSource, 256)

  // meta untuk progress bar
  const stageMeta = STAGES.map(({ key, label }) => {
    const list = chain?.[key] || []
    const last = list.length ? list[list.length - 1] : null
    const note = last?.notes || last?.header?.officerNote || last?.header?.note || ''
    return {
      key,
      label,
      has: !!last,
      date: fmtDateShort(last?.createdAt),
      investigator: last?.header?.investigator || '',
      note: truncate(note, 256)
    }
  })

  // foto besar utk acquisition: ambil preview terakhir yang ada
  const acqPreview =
    latest?.type === 'acquisition'
      ? [...(latest?.steps || [])].reverse().find((s) => s?.previewDataUrl)?.previewDataUrl || null
      : null

  // ===== investigator name for heading =====
  const headingInvestigator = caseRef?.investigator || latest?.header?.investigator || '-'

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {/* breadcrumb + actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm">
          <button className="btn" onClick={() => nav(-1)}>
            ←
          </button>
          <span style={{ color: 'var(--dim)' }}>Evidence Management</span>
        </div>
        <MiniButton>Export PDF</MiniButton>
      </div>

      {/* heading */}
      <h1 className="text-2xl font-semibold mb-1">{evidence.id}</h1>
      <div className="text-sm opacity-80 mb-4">
        {headingInvestigator} • {headerMeta.date}
      </div>

      {/* meta line */}
      <div className="text-sm mb-6 flex flex-wrap gap-x-6 gap-y-2">
        <div>
          <span className="opacity-60">Person Related:</span> {personRef?.name || '-'}
        </div>
        <div>
          <span className="opacity-60">Case Related:</span> {caseRef?.name || '-'}
        </div>
        <div>
          <span className="opacity-60">Source:</span> {evidence.source || '-'}
        </div>
      </div>

      {/* summary */}
      <div
        className="border rounded-xl p-4 mb-6"
        style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
      >
        <div className="flex gap-4">
          <div
            className="w-28 h-20 rounded border flex items-center justify-center overflow-hidden"
            style={{ borderColor: 'var(--border)' }}
          >
            {evidence.previewDataUrl || evidence.previewUrl ? (
              <img
                src={evidence.previewDataUrl || evidence.previewUrl}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs opacity-60">No Preview</span>
            )}
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dim)' }}>
              Summary
            </div>
            <div className="text-sm">{evidence.summary || '-'}</div>
          </div>
          <div className="text-xs opacity-60">Chain of Custody A</div>
        </div>
      </div>

      {/* ======= VISUAL PROGRESS ======= */}
      <div className="border rounded-xl p-5 mb-4" style={{ borderColor: 'var(--border)' }}>
        <div className="text-2xl font-semibold mb-6">Chain of custody</div>

        {/* Grid 7 kolom: O — O — O — O */}
        <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto] items-center gap-x-4 mb-4">
          {stageMeta.map((m, idx) => {
            const style = STAGE_STYLE[m.key] || NODE_DEFAULT
            const isActive = active === m.key
            const filled = m.has
            return (
              <Fragment key={m.key}>
                <button
                  onClick={() => setActive(m.key)}
                  className="relative w-5 h-5 rounded-full transition-colors"
                  style={{
                    background: isActive
                      ? style.fill
                      : filled
                        ? style.fill + '33'
                        : NODE_DEFAULT.fill,
                    border: `${1.5}px solid ${isActive || filled ? style.border : NODE_DEFAULT.border}`
                  }}
                  title={m.label}
                />
                {idx < stageMeta.length - 1 && (
                  <div className="relative h-5 w-full">
                    <div
                      className="absolute left-0 right-0 border-t-2 border-dashed"
                      style={{ top: '50%', transform: 'translateY(-50%)', borderColor: '#888888' }}
                    />
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>

        {/* label + meta di bawah node */}
        <div className="grid grid-cols-4 gap-6">
          {stageMeta.map((m) => (
            <div key={m.key} className="flex flex-col items-center text-center">
              <div className="text-lg font-semibold mb-1">{m.label}</div>
              {m.date && <div className="text-sm opacity-60">{m.date}</div>}
              {m.investigator && <div className="text-sm opacity-60">{m.investigator}</div>}
              {m.note && <div className="text-sm opacity-70 mt-1">notes: {m.note}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ======= TABS ======= */}
      <div className="flex gap-3 mb-3">
        {STAGES.map((s) => {
          const style = STAGE_STYLE[s.key] || NODE_DEFAULT
          const isActive = active === s.key
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className="px-4 py-2 rounded-lg border transition-colors text-sm font-medium"
              style={{
                border: `${1.5}px solid ${isActive ? style.border : NODE_DEFAULT.border}`,
                background: isActive ? style.fill : NODE_DEFAULT.fill,
                color: isActive ? 'white' : '#ddd'
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {/* ===== Panel stage ===== */}
      <div
        className="border rounded-xl p-5"
        style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
      >
        {/* header lokasi kiri, waktu & investigator kanan */}
        <div className="flex items-start justify-between">
          <div className="text-xl font-semibold">{panelLocation || latest?.title || ''}</div>
          <div className="text-right">
            {panelDatetime && <div className="text-sm opacity-60">{panelDatetime}</div>}
            {panelInvestigator && <div className="text-sm opacity-60">{panelInvestigator}</div>}
          </div>
        </div>

        <div className="h-px my-4" style={{ background: 'var(--border)' }} />

        {!latest ? (
          <div className="text-sm opacity-70 py-8 text-center">State masih kosong</div>
        ) : (
          <div className="grid gap-6">
            {/* Acquisition: langkah + foto besar */}
            {active === 'acquisition' && (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-8">
                <div>
                  <div className="text-lg font-semibold mb-2">
                    {latest.title || 'Langkah - langkah penyitaan barang bukti:'}
                  </div>
                  <ol className="list-decimal pl-6 text-base leading-relaxed space-y-2">
                    {(latest.steps || []).map((s, i) => (
                      <li key={i} className="whitespace-pre-wrap">
                        {s?.desc}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="md:justify-self-end">
                  {acqPreview ? (
                    <img
                      src={acqPreview}
                      alt="acquisition"
                      className="w-[380px] max-w-full aspect-4/3 object-cover rounded border"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  ) : (
                    <div
                      className="w-[380px] max-w-full aspect-4/3 grid place-items-center rounded border text-sm opacity-60"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      Tidak ada foto
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preparation: hipotesis & tools (judul ikut modal bila ada) */}
            {active === 'preparation' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <div className="text-lg font-semibold mb-2">
                    {latest.hypothesisTitle || 'Hipotesis penyelidikan'}
                  </div>
                  <ol className="list-decimal pl-6 text-base leading-relaxed">
                    {(latest.hypothesis || []).map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <div className="text-lg font-semibold mb-2">
                    {latest.toolsTitle || 'Tools yang akan digunakan'}
                  </div>
                  <ol className="list-decimal pl-6 text-base leading-relaxed">
                    {Array.isArray(latest.tools)
                      ? latest.tools.map((t, i) => <li key={i}>{t}</li>)
                      : (latest.tools || '')
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean)
                          .map((t, i) => <li key={i}>{t}</li>)}
                  </ol>
                </div>
              </div>
            )}

            {/* Device line */}
            {deviceLine && <div className="text-xl font-semibold">{deviceLine}</div>}

            {/* Notes box */}
            {notePreview && (
              <div
                className="rounded-xl border p-5 bg-white/50"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="text-lg font-semibold mb-2">Notes</div>
                <div className="text-base leading-relaxed">{notePreview}</div>
              </div>
            )}

            {/* (opsional) daftar item-detail di bawah ringkasan */}
            {contents.length > 0 && (
              <div className="grid gap-3">
                {contents.map((it) => (
                  <StageItemCard key={it.id} item={it} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <MiniButton onClick={() => setModal(true)}>+ Add content</MiniButton>
        </div>
      </div>

      {/* modal */}
      <StageContentModal
        open={modal}
        stage={active}
        evidenceId={evidence.id}
        onClose={() => setModal(false)}
        onSubmit={(payload) => {
          setModal(false)
          handleSubmitStage(payload)
        }}
      />
    </div>
  )
}

/* ===== Renderer item per tipe ===== */
function StageItemCard({ item }) {
  const safeTitle =
    item.title ||
    (item.type === 'acquisition' && 'Penyitaan') ||
    (item.type === 'preparation' && 'Preparation') ||
    (item.type === 'extraction' && 'Extraction') ||
    (item.type === 'analysis' && 'Analysis') ||
    'Untitled'

  return (
    <div className="rounded border p-3" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between mb-1">
        <div className="text-sm font-medium">{safeTitle}</div>
        {item.createdAt && (
          <div className="text-[11px] opacity-60">
            {new Date(item.createdAt).toLocaleString('id-ID')}
          </div>
        )}
      </div>

      {item.header && (
        <div className="text-xs opacity-80 mb-2">
          {[
            item.header.location,
            item.header.investigator,
            item.header.devType,
            item.header.itemType && `(${item.header.itemType})`,
            item.header.itemDetail
          ]
            .filter(Boolean)
            .join(' • ')}
        </div>
      )}

      {item.type === 'acquisition' && Array.isArray(item.steps) && (
        <div className="grid gap-2">
          {item.steps.map((s, i) => (
            <div key={i} className="grid grid-cols-[1.5rem_1fr_auto] items-start gap-2">
              <div className="opacity-60 text-xs">{s.no}</div>
              <div className="text-sm whitespace-pre-wrap">{s.desc}</div>
              {s.previewDataUrl && (
                <img
                  src={s.previewDataUrl}
                  alt="step"
                  className="h-16 w-24 object-cover rounded border"
                  style={{ borderColor: 'var(--border)' }}
                />
              )}
            </div>
          ))}
          {item.header?.officerNote && (
            <div className="mt-2 text-sm opacity-80">
              <span className="font-medium">Catatan:</span> {item.header.officerNote}
            </div>
          )}
        </div>
      )}

      {item.type === 'preparation' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-semibold" style={{ color: 'var(--dim)' }}>
              Hipotesis
            </div>
            <ul className="list-disc pl-5 text-sm">
              {(item.hypothesis || []).map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold" style={{ color: 'var(--dim)' }}>
              Tools
            </div>
            <div className="text-sm">
              {Array.isArray(item.tools) ? item.tools.join(', ') : item.tools || '-'}
            </div>
          </div>
        </div>
      )}

      {item.type === 'extraction' && item.file && (
        <div className="grid gap-2">
          <div className="text-sm">
            File: {item.file.name} ({Math.round((item.file.size || 0) / 1024)} KB)
          </div>
          {item.file.previewDataUrl && (
            <img
              src={item.file.previewDataUrl}
              alt="extraction"
              className="h-32 object-contain rounded border"
              style={{ borderColor: 'var(--border)' }}
            />
          )}
        </div>
      )}

      {item.type === 'analysis' && (
        <div className="grid gap-3">
          {Array.isArray(item.expectations) && item.expectations.length > 0 && (
            <div>
              <div className="text-xs font-semibold" style={{ color: 'var(--dim)' }}>
                Ekspektasi
              </div>
              <ul className="list-disc pl-5 text-sm">
                {item.expectations.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {item.result && (
            <div>
              <div className="text-xs font-semibold" style={{ color: 'var(--dim)' }}>
                Hasil analisa
              </div>
              <div className="text-sm whitespace-pre-wrap">{item.result}</div>
            </div>
          )}
          {item.report && (
            <div>
              <div className="text-xs font-semibold" style={{ color: 'var(--dim)' }}>
                Report
              </div>
              <div className="text-sm mb-2">
                {item.report.name} ({Math.round((item.report.size || 0) / 1024)} KB)
              </div>
              {item.report.previewDataUrl && (
                <img
                  src={item.report.previewDataUrl}
                  alt="report"
                  className="h-32 object-contain rounded border"
                  style={{ borderColor: 'var(--border)' }}
                />
              )}
            </div>
          )}
          {item.conclusion && (
            <div>
              <div className="text-xs font-semibold" style={{ color: 'var(--dim)' }}>
                Kesimpulan
              </div>
              <div className="text-sm whitespace-pre-wrap">{item.conclusion}</div>
            </div>
          )}
        </div>
      )}

      {item.notes && !item.type && (
        <div className="text-sm opacity-80 whitespace-pre-wrap mt-2">{item.notes}</div>
      )}
    </div>
  )
}
