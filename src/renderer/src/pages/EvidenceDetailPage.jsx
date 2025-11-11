/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/rules-of-hooks */
import { Fragment, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCases } from '../store/cases'
import MiniButton, { MiniButtonContent } from '../components/MiniButton'
import StageContentModal from '../components/StageContentModal'
import CaseLayout from './CaseLayout'
import bgButton from '../assets/image/bg-button.svg'
import { BoxAllSide, BoxNone, BoxTopLeftBottomRight, BoxTopRight } from '../components/BaseBox'
import stageOn from '../assets/image/stage-on.svg'
import stageOff from '../assets/image/stage-off.svg'
import bgButtonTransparent from '../assets/image/bg-button-transparent.svg'
import { FaEdit, FaFile, FaRegSave } from 'react-icons/fa'
import HorizontalLine from '../components/common/HorizontalLine'
import EditEvidenceModal from '../components/EditEvidenceModal'
import bgExtranctionResult from '../assets/image/bg-extraction-result.svg'
import SummaryBox from '../components/SummaryBox'
import { LiaEditSolid } from 'react-icons/lia'
import editBg from '../assets/image/edit.svg'

const STAGES = [
  { key: 'acquisition', label: 'Acquisition' },
  { key: 'preparation', label: 'Preparation' },
  { key: 'extraction', label: 'Extraction' },
  { key: 'analysis', label: 'Analysis' }
]

// ====== Accent warna per stage ======
const STAGE_STYLE = {
  acquisition: { fill: '#243F65', border: '#A9CCFD' },
  preparation: { fill: '#243F65', border: '#A9CCFD' },
  extraction: { fill: '#243F65', border: '#A9CCFD' },
  analysis: { fill: '#243F65', border: '#A9CCFD' }
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
  const updateEvidence = useCases((s) => s.updateEvidence)

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
  const [editOpen, setEditOpen] = useState(false)
  const [openStage, setOpenStage] = useState(null)

  const chain = evidence.chain || { acquisition: [], preparation: [], extraction: [], analysis: [] }
  const contents = chain?.[active] ?? []
  const latest = Array.isArray(contents) ? contents[contents.length - 1] || null : contents || null
  console.log('latest : ', latest)
  console.log('contents : ', contents)
  // meta kecil di heading (tanggal dibuat evidence)
  const headerMeta = useMemo(() => {
    const d = new Date(evidence.createdAt || Date.now())
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`
    return { date }
  }, [evidence.createdAt])

  // ✅ FIXED: fungsi submit stage sekarang kompatibel dengan StageContentModal
  function handleSubmitStage(stage, data) {
    addChainContent(evidence.id, stage, data)
  }

  // ===== panel header fields =====
  const panelLocation = latest?.location || ''
  const panelDatetime = fmtDateLong(latest?.createdAt)
  const panelInvestigator = latest?.investigator || ''

  const devicePieces = []
  if (latest?.header?.devType) devicePieces.push(latest.header.devType)
  const modelLike =
    latest?.header?.itemDetail || latest?.header?.devModel || latest?.header?.devName
  if (modelLike) devicePieces.push(`: ${modelLike}`)
  if (latest?.header?.phoneNumber) devicePieces.push(` ${latest.header.phoneNumber}`)
  const deviceLine = devicePieces.join('')

  // Notes prioritas dari modal (item.notes)
  const noteSource = latest?.notes || latest?.summary || ''
  const notePreview = truncate(noteSource, 256)

  // meta untuk progress bar
  const stageMeta = STAGES.map(({ key, label }) => {
    const list = chain?.[key]
    const last = Array.isArray(list)
      ? list[list.length - 1]
      : list && typeof list === 'object'
        ? list
        : null
    const note = last?.notes || last?.summary || ''
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
    active === 'acquisition'
      ? [...(latest?.steps || [])].reverse().find((s) => s?.previewDataUrl)?.previewDataUrl || null
      : null

  // ===== investigator name for heading =====
  const headingInvestigator = caseRef?.investigator || latest?.header?.investigator || '-'
  const [summary, setSummary] = useState('')
  const savingRef = useRef(false)
  const [isEditing, setIsEditing] = useState(false)

  const actionLabel = isEditing ? 'Save' : summary.trim() ? 'Edit' : 'Add'
  const actionIcon = isEditing ? (
    <FaRegSave className="text-[16px]" />
  ) : (
    <LiaEditSolid className="text-[18px]" />
  )

  const onSummaryAction = async () => {
    if (!isEditing) {
      setIsEditing(true)
      return
    }
    if (savingRef.current) return
    savingRef.current = true
    try {
      setIsEditing(false)
      // updateCase(item.id, { summary })
    } catch (e) {
      console.log(e)
    } finally {
      savingRef.current = false
    }
  }

  return (
    <CaseLayout title="Evidence Management" showBack={true}>
      <div className="mx-auto py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold mb-1">{evidence.id}</h1>
            <div className="text-sm opacity-80 mb-4">
              {headingInvestigator} • {headerMeta.date}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MiniButton onClick={() => setEditOpen(true)}>
              <MiniButtonContent
                bg={bgButtonTransparent}
                text="Edit"
                icon={<FaEdit />}
                textColor="text-white"
              />
            </MiniButton>

            <MiniButton>
              <MiniButtonContent bg={bgButton} text="+ Export PDF" textColor="text-black" />
            </MiniButton>
          </div>
        </div>
        <div className="text-sm flex flex-wrap gap-x-6 gap-y-2">
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
        <div className="mt-5 border-t" style={{ borderColor: '#C3CFE0' }} />
        <StageContentModal
          open={!!openStage}
          initialStage={openStage}
          caseNumber={caseRef?.id || 'CASE-UNKNOWN'}
          caseTitle={caseRef?.name || 'Untitled Case'}
          onClose={() => setOpenStage(null)}
          onSubmitStage={handleSubmitStage}
        />
      </div>
      <div className="space-y-8">
        <BoxTopRight>
          <div className="flex gap-4">
            <div
              className="w-40 h-32 rounded border flex items-center justify-center overflow-hidden"
              style={{ borderColor: 'var(--border)' }}
            >
              {evidence.previewDataUrl || evidence.previewUrl ? (
                <img
                  src={evidence.previewDataUrl || evidence.previewUrl}
                  alt="preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs opacity-60">No Preview</span>
              )}
            </div>
            <div className="flex flex-row items-start justify-between w-full">
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dim)' }}>
                  Summary
                </div>
                <div className="text-sm mt-3">{evidence.summary || '-'}</div>
              </div>

              <div
                className="text-xs px-2 py-1 font-[Aldrich] self-start min-w-28 text-center"
                style={{
                  borderBottom: '1px solid #A9CCFD',
                  backgroundColor: '#142338',
                  color: '#A9CCFD'
                }}
              >
                {active}
              </div>
            </div>
          </div>
        </BoxTopRight>

        <BoxNone>
          <div className="border rounded-xl p-2 mb-4" style={{ borderColor: 'var(--border)' }}>
            <div className="text-2xl font-semibold mb-10">Chain of custody</div>

            <div className="max-w-4xl mx-auto grid place-items-center justify-items-center grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto] items-center gap-x-4 mb-4">
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
                          style={{
                            top: '50%',
                            transform: 'translateY(-50%)',
                            borderColor: '#888888'
                          }}
                        />
                      </div>
                    )}
                  </Fragment>
                )
              })}
            </div>

            <div className="grid grid-cols-4 gap-6">
              {stageMeta.map((m) => (
                <div key={m.key} className="flex flex-col items-center text-center">
                  <div className="text-lg font-semibold mb-1">{m.label}</div>
                  {m.date && <div className="text-sm opacity-60">{m.date}</div>}
                  {m.investigator && <div className="text-sm opacity-60">{m.investigator}</div>}
                  {m.note && <div className="text-sm opacity-70 mt-1">notes: {m.note}</div>}
                  {m.summary}
                </div>
              ))}
            </div>
          </div>
        </BoxNone>

        <BoxTopLeftBottomRight>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {STAGES.map((s) => {
              const isActive = active === s.key
              const bg = isActive ? stageOn : stageOff
              return (
                <div
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className="relative w-[300px] h-20 flex items-center justify-center text-sm font-medium"
                >
                  <img
                    src={bg}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none select-none"
                  />
                  <span className="relative z-10 flex items-center gap-2 text-white">
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
          <HorizontalLine color={'#C3CFE0'} />
          <div className="">
            {latest &&
              typeof latest === 'object' &&
              !Array.isArray(latest) &&
              Object.keys(latest ?? {}).length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-[18px] font-semibold">
                      {panelLocation || 'Unknown Location'}
                    </div>
                    <div className="text-right">
                      {panelDatetime && <div className="text-[18px]">{panelDatetime}</div>}
                      {panelInvestigator && (
                        <div className="text-[18px] opacity-80">{panelInvestigator}</div>
                      )}
                    </div>
                  </div>
                  <HorizontalLine />
                  <div className="flex flex-row gap-5 mb-3">
                    <div>Evidence Source : {latest.source}</div>
                    <div>Evidence Type : {latest.type}</div>
                    <div>Evidence Detail : {latest.detail}</div>
                  </div>
                </>
              )}
            {!latest ? (
              <div className="text-sm opacity-70 py-8 text-center"></div>
            ) : (
              <div className="grid gap-6">
                {active === 'acquisition' && (
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-8">
                    <div>
                      <div className="text-lg font-semibold mb-2">
                        {latest.title || 'Steps for Confiscating Evidence : '}
                      </div>
                      <ol className="list-decimal pl-6 text-base leading-relaxed space-y-2">
                        {(latest.steps || []).map((s, i) => (
                          <li key={i} className="whitespace-pre-wrap">
                            {s?.desc || s}
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

                {active === 'preparation' && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-base">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="text-left text-lg font-semibold pb-2">
                            Investigation Hypothesis
                          </th>
                          <th className="text-left text-lg font-semibold pb-2 w-1/4">Tool Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(latest.pairs || []).map((p, i) => (
                          <tr
                            key={i}
                            className="border-b border-gray-700 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-2 align-top">
                              <div className="flex items-start">
                                {/* <span className="mr-2">{i + 1}.</span> */}
                                <span className="whitespace-pre-wrap">{p.investigation}</span>
                              </div>
                            </td>
                            <td className="py-2 align-top font-medium">{p.tools}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {active === 'extraction' && (
                  <div className="flex justify-center items-center my-5 relative">
                    <img src={bgExtranctionResult} width={180} />
                    <div className="absolute -mt-8 text-center">
                      <p className="font-bold">Handphone A</p>
                      <p>Size : 67gb</p>
                    </div>
                    <button className="absolute bg-[#2A3A51] px-5 mt-32 border-y-black border border-x-0">
                      Download
                    </button>
                  </div>
                )}
                {active === 'analysis' && (
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] place-items-center gap-8">
                    {/* === KIRI: Analysis Result === */}
                    <div>
                      <div className="text-lg font-semibold mb-3">Analysis Result:</div>
                      <ol className="list-decimal pl-6 text-base leading-relaxed space-y-3">
                        {(latest.analysisPairs || []).map((p, i) => (
                          <li key={i} className="space-y-1">
                            <div className="whitespace-pre-wrap">{p.result}</div>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* === KANAN: File Report / Summary === */}
                    <div className="md:justify-self-end">
                      <BoxAllSide>
                        <BoxAllSide>
                          <div className="flex flex-row justify-center items-center gap-5">
                            <FaFile size={30} />
                            <div className="flex flex-col">
                              <p className="font-bold">Handphone A</p>
                              <p>Size : 67gb</p>
                            </div>
                          </div>
                        </BoxAllSide>
                        <button className="bg-[#2A3A51] px-5 mt-5 border-y-black border border-x-0 flex justify-self-center">
                          Download
                        </button>
                      </BoxAllSide>
                      {/* <div className="border rounded-2xl p-5 bg-white/5 w-full max-w-[300px] text-center">
                        <div className="flex flex-col items-center justify-center border border-gray-500 rounded-lg py-6 mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-10 h-10 mb-3 opacity-80"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m0 0l6-6m-6 6l-6-6"
                            />
                          </svg>
                          <div className="text-lg font-semibold">PDF Report</div>
                          <div className="text-sm opacity-70">File: 14 Mb</div>
                        </div>

                        <button className="px-5 py-2 bg-[#394F6F] text-white font-medium rounded-md hover:bg-[#4b618a] transition">
                          Download
                        </button>
                      </div> */}
                    </div>
                  </div>
                )}

                {/* {deviceLine && <div className="text-xl font-semibold">{deviceLine}ppp</div>} */}

                {/* {Array.isArray(contents) && contents.length > 0 && (
                  <div className="grid gap-3">
                    pppp
                    {contents.map((it) => (
                      <StageItemCard key={it.id} item={it} />
                    ))}
                  </div>
                )} */}
                {notePreview && (
                  <>
                    <div
                      className="rounded-xl border p-5 bg-white/50"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div className="text-lg font-semibold mb-2">Notes</div>
                      <div className="text-base leading-relaxed">{notePreview}</div>
                    </div>
                    <SummaryBox
                      title="Summary"
                      value={summary}
                      onChange={setSummary}
                      placeholder="Click Add to write summary"
                      editable={isEditing}
                      actionLabel={actionLabel}
                      actionIcon={actionIcon}
                      actionBgImage={editBg}
                      actionSize={{ w: 70, h: 27 }}
                      actionOffset={{ top: 15, right: 24 }}
                      onAction={onSummaryAction}
                    />
                  </>
                )}
              </div>
            )}
            {(!latest ||
              (typeof latest === 'object' &&
                !Array.isArray(latest) &&
                Object.keys(latest ?? {}).length === 0)) && (
              <div className="mt-6 flex justify-center">
                <div className="inline-block bg-[#394F6F] rounded-md">
                  <MiniButton onClick={() => setOpenStage(active)}>+ Add content</MiniButton>
                </div>
              </div>
            )}
          </div>
        </BoxTopLeftBottomRight>

        <EditEvidenceModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={(updated) => {
            updateEvidence(updated.id, {
              summary: updated.summary,
              source: updated.source,
              investigator: updated.investigator,
              personOfInterest: updated.personOfInterest,
              fileName: updated.fileName,
              fileSize: updated.fileSize,
              fileMime: updated.fileMime,
              previewDataUrl: updated.previewDataUrl
            })
            setEditOpen(false)
          }}
          evidenceData={evidence}
          caseName={caseRef?.name}
        />
      </div>
    </CaseLayout>
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
              <div className="text-sm whitespace-pre-wrap">{s.desc || s}</div>
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
                  <li key={i}>{e} ppp </li>
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
