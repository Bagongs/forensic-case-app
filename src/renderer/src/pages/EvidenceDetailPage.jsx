/* eslint-disable react-hooks/rules-of-hooks */
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCases } from '../store/cases'
import MiniButton, { MiniButtonContent } from '../components/common/MiniButton'
import StageContentModal from '../components/modals/evidence/StageContentModal'
import CaseLayout from './CaseLayout'
import { BoxAllSide, BoxNone, BoxTopLeftBottomRight, BoxTopRight } from '../components/box/BaseBox'
import stageOn from '../assets/image/stage-on.svg'
import stageOff from '../assets/image/stage-off.svg'
import bgButton from '../assets/image/bg-button.svg'
import bgButtonTransparent from '../assets/image/bg-button-transparent.svg'
import { FaEdit, FaRegSave } from 'react-icons/fa'
import HorizontalLine from '../components/common/HorizontalLine'
import EditEvidenceModal from '../components/modals/evidence/EditEvidenceModal'
import bgExtranctionResult from '../assets/image/bg-extraction-result.svg'
import { LiaEditSolid } from 'react-icons/lia'
import editBg from '../assets/image/edit.svg'
import NotesBox from '../components/box/NotesBox'
import Pagination from '../components/common/Pagination'

// ⬇️ ikon report lokal (untuk panel Analysis)
import iconReport from '@renderer/assets/icons/icon_report.svg'

const STAGES = [
  { key: 'acquisition', label: 'Acquisition' },
  { key: 'preparation', label: 'Preparation' },
  { key: 'extraction', label: 'Extraction' },
  { key: 'analysis', label: 'Analysis' }
]

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

  const headerMeta = useMemo(() => {
    const d = new Date(evidence.createdAt || Date.now())
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(d.getFullYear()).slice(-2)}`
    return { date }
  }, [evidence.createdAt])

  function handleSubmitStage(stage, data) {
    addChainContent(evidence.id, stage, data)
  }

  const panelLocation = latest?.location || ''
  const panelDatetime = fmtDateLong(latest?.createdAt)
  const panelInvestigator = latest?.investigator || ''

  const stageMeta = STAGES.map(({ key, label }) => {
    const list = chain?.[key]
    const last = Array.isArray(list)
      ? list[list.length - 1]
      : list && typeof list === 'object'
        ? list
        : null
    return {
      key,
      label,
      has: !!last,
      date: fmtDateShort(last?.createdAt),
      investigator: last?.investigator || ''
    }
  })

  const headingInvestigator = caseRef?.investigator || latest?.investigator || '-'

  // ==== NotesBox state ====
  const [notesValue, setNotesValue] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const savingRef = useRef(false)

  const notesActionLabel = isEditingNotes ? 'Save' : notesValue.trim() ? 'Edit' : 'Add'
  const notesActionIcon = isEditingNotes ? (
    <FaRegSave className="text-[16px]" />
  ) : (
    <LiaEditSolid className="text-[18px]" />
  )

  const onNotesAction = async () => {
    if (!isEditingNotes) {
      setIsEditingNotes(true)
      return
    }
    if (savingRef.current) return
    savingRef.current = true
    try {
      const text = notesValue.trim()
      useCases.getState().updateChainNotes(evidence.id, active, text)
      setIsEditingNotes(false)
    } finally {
      savingRef.current = false
    }
  }

  const showContent =
    latest &&
    typeof latest === 'object' &&
    !Array.isArray(latest) &&
    Object.keys(latest ?? {}).length > 0

  // urutan stage (pastikan sesuai STAGES)
  const stageOrder = ['acquisition', 'preparation', 'extraction', 'analysis']
  const firstEmptyStage = stageOrder.find((s) => {
    const content = chain?.[s]
    if (!content) return true
    if (Array.isArray(content) && content.length === 0) return true
    if (typeof content === 'object' && Object.keys(content).length === 0) return true
    return false
  })

  // cek apakah stage sebelumnya sudah punya data
  const canAddContent = (() => {
    const currentIndex = stageOrder.indexOf(active)
    if (currentIndex === 0) return true // stage pertama selalu bisa diisi

    const prevStage = stageOrder[currentIndex - 1]
    const prevContent = chain?.[prevStage]

    if (!prevContent) return false
    if (Array.isArray(prevContent) && prevContent.length === 0) return false
    if (typeof prevContent === 'object' && Object.keys(prevContent).length === 0) return false
    return true
  })()

  // ===== Pagination Acquisition Photos =====
  const [page, setPage] = useState(1)
  const totalPages = latest?.photos?.length || 0
  const currentImg = totalPages > 0 ? latest?.photos[page - 1] : null

  // ===== Pagination Analysis Reports (baru) =====
  const [reportPage, setReportPage] = useState(1)
  const totalReports = Array.isArray(latest?.reports) ? latest.reports.length : 0
  const currentReport = totalReports > 0 ? latest.reports[reportPage - 1] : null

  // reset pagination saat berpindah tab agar aman
  useEffect(() => {
    setPage(1)
    setReportPage(1)
  }, [active])

  const [investigationTools, setInvestigationTools] = useState(null)
  useEffect(() => {
    setInvestigationTools(ref.evidence.chain.preparation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ===== Helpers untuk report (download & ukuran) =====
  function downloadReport(rep) {
    if (!rep?.base64) return
    const a = document.createElement('a')
    a.href = rep.base64 // dataURL dari FileReader
    a.download = rep.name || 'report.pdf'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
  function approxSizeLabel(dataUrl) {
    if (!dataUrl) return '-'
    const b64 = dataUrl.split(',')[1] || ''
    const bytes =
      Math.ceil((b64.length * 3) / 4) - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0)
    const mb = bytes / (1024 * 1024)
    return mb >= 0.5 ? `${mb.toFixed(0)} Mb` : `${(bytes / 1024).toFixed(0)} Kb`
  }

  useEffect(() => {
    if (!latest) {
      setNotesValue('')
      return
    }

    let stageNotes = ''
    stageNotes = latest?.notes || latest?.[active]?.notes || ''
    setNotesValue(stageNotes)
  }, [active, latest])

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
          investigationTools={investigationTools}
        />
      </div>

      <div className="space-y-8">
        {/* HEADER OVERVIEW */}
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
              <div className="w-full">
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dim)' }}>
                  Overview
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

        {/* CHAIN OF CUSTODY */}
        <BoxNone>
          <div className="p-2 mb-4">
            <div className="text-2xl font-semibold mb-10">Chain of custody</div>

            <div className="max-w-4xl mx-auto grid place-items-center justify-items-center grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto] items-center gap-x-4 mb-4">
              {stageMeta.map((m, idx) => {
                const style = STAGE_STYLE[m.key] || NODE_DEFAULT
                const isActive = active === m.key

                return (
                  <Fragment key={m.key}>
                    <button
                      onClick={() => setActive(m.key)}
                      className="relative w-5 h-5 rounded-full transition-colors"
                      style={{
                        background: isActive ? style.fill : NODE_DEFAULT.fill,
                        border: `${1.5}px solid ${isActive ? style.border : NODE_DEFAULT.border}`
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
                  {!(m.date || m.investigator) && <div>Not Recorded</div>}
                  {m.key === firstEmptyStage && (
                    <div className="flex justify-center mt-2">
                      <div className="inline-block rounded-md bg-[#394F6F]">
                        <MiniButton onClick={() => setOpenStage(m.key)}>+ Add content</MiniButton>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </BoxNone>

        {/* STAGE TABS + CONTENT */}
        <BoxTopLeftBottomRight>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {STAGES.map((s) => {
              const isActive = active === s.key
              const bg = isActive ? stageOn : stageOff
              return (
                <div
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className="relative w-[300px] h-20 flex items-center justify-center text-sm font-medium cursor-pointer"
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
          <HorizontalLine color="#C3CFE0" />

          <div>
            {showContent && (
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
                  <div>Evidence Source : {latest?.source || '-'}</div>
                  <div>Evidence Type : {latest?.type || '-'}</div>
                  <div>Evidence Detail : {latest?.detail || '-'}</div>
                </div>
              </>
            )}

            {!latest ? (
              <></>
            ) : (
              <div className="grid gap-6">
                {active === 'acquisition' && showContent && (
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-8">
                    <div>
                      <div className="text-lg font-semibold mb-2">
                        {latest?.title || 'Steps for Confiscating Evidence : '}
                      </div>
                      <ol className="list-decimal pl-6 text-base leading-relaxed space-y-2">
                        {(latest?.steps || []).map((s, i) => (
                          <li key={i} className="whitespace-pre-wrap">
                            {s?.desc || s}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="md:justify-self-end">
                      {currentImg ? (
                        <img
                          src={currentImg}
                          alt={`acquisition-${page}`}
                          className="w-[300px] max-w-full aspect-4/3 object-contain rounded border"
                          style={{ borderColor: 'var(--border)' }}
                        />
                      ) : (
                        <div
                          className="w-[300px] max-w-full aspect-4/3 grid place-items-center rounded border text-sm opacity-60"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          No Image
                        </div>
                      )}
                      <div className="flex justify-center my-3">
                        {totalPages > 1 && (
                          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {active === 'preparation' && showContent && (
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

                {active === 'extraction' && showContent && (
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

                {active === 'analysis' && showContent && (
                  <div className="flex flex-row justify-between gap-8">
                    {/* KIRI: hasil analisis */}
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

                    {/* KANAN: Card file (tampilan tetap), isi & pagination dinamis */}
                    <div className="md:justify-self-end">
                      <BoxAllSide>
                        <BoxAllSide>
                          <div className="flex flex-row justify-center items-center gap-5">
                            {/* ikon lokal */}
                            <img src={iconReport} alt="report" className="w-[30px] h-[30px]" />
                            <div className="flex flex-col">
                              <p className="font-bold truncate max-w-[220px]">
                                {currentReport?.name || 'No Report'}
                              </p>
                              <p>
                                Size : {currentReport ? approxSizeLabel(currentReport.base64) : '-'}
                              </p>
                            </div>
                          </div>
                        </BoxAllSide>
                        <button
                          className="bg-[#2A3A51] px-5 mt-5 border-y-black border border-x-0 flex justify-self-center disabled:opacity-60"
                          onClick={() => currentReport && downloadReport(currentReport)}
                          disabled={!currentReport}
                        >
                          Download
                        </button>
                      </BoxAllSide>

                      {/* Pagination khusus report di bawah card */}
                      <div className="flex justify-center my-3">
                        {totalReports > 1 && (
                          <Pagination
                            page={reportPage}
                            totalPages={totalReports}
                            onChange={setReportPage}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {showContent && (
                  <NotesBox
                    title="Notes"
                    value={notesValue}
                    onChange={setNotesValue}
                    placeholder="Click Add to write notes"
                    editable={isEditingNotes}
                    actionLabel={notesActionLabel}
                    actionIcon={notesActionIcon}
                    actionBgImage={editBg}
                    actionSize={{ w: 70, h: 27 }}
                    actionOffset={{ top: 15, right: 24 }}
                    onAction={onNotesAction}
                  />
                )}
              </div>
            )}

            {/* Tombol Add content bila kosong */}
            {(!latest ||
              (typeof latest === 'object' &&
                !Array.isArray(latest) &&
                Object.keys(latest ?? {}).length === 0)) && (
              <div className="my-32 flex justify-center">
                <div
                  className={`inline-block rounded-md ${
                    canAddContent ? 'bg-[#394F6F]' : 'bg-[#1f2937] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <MiniButton
                    onClick={() => canAddContent && setOpenStage(active)}
                    disabled={!canAddContent}
                  >
                    + Add content
                  </MiniButton>
                </div>
              </div>
            )}
          </div>
        </BoxTopLeftBottomRight>

        <EditEvidenceModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={(updated) => {
            updateEvidence(
              updated.id,
              {
                summary: updated.summary,
                source: updated.source,
                investigator: updated.investigator,
                personOfInterest: updated.personOfInterest,
                fileName: updated.fileName,
                fileSize: updated.fileSize,
                fileMime: updated.fileMime,
                previewDataUrl: updated.previewDataUrl
              },
              {
                // personPatch
                name:
                  updated.poiMode === 'unknown'
                    ? 'Unknown'
                    : updated.personName?.trim() || 'Unknown',
                status: updated.poiMode === 'unknown' ? null : updated.status || null
              }
            )
            setEditOpen(false)
          }}
          evidenceData={evidence}
          caseName={caseRef?.name}
          personData={personRef}
        />
      </div>
    </CaseLayout>
  )
}
