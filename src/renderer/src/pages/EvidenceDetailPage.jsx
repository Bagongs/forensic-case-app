/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEvidences } from '../store/evidences'
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
import iconReport from '@renderer/assets/icons/icon_report.svg'
import { useEvidenceApi } from '../hooks/useEvidenceApi'
import toast from 'react-hot-toast'

const BACKEND_BASE =
  import.meta.env?.VITE_BACKEND_URL || window?.api?.backendBase || 'http://172.15.2.105:8000'

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

  // store lama (masih dipakai untuk update evidence via modal)
  const updateEvidenceRemote = useEvidences((s) => s.updateEvidence)

  // store baru untuk detail evidence (IPC evidence:detail)
  const {
    createCustodyAcquisition,
    createCustodyPreparation,
    createCustodyExtraction,
    createCustodyAnalysis,
    updateCustodyNotes
  } = useEvidenceApi()

  const fetchEvidenceDetail = useEvidences((s) => s.fetchEvidenceDetail)

  const detail = useEvidences((s) => s.detail)
  const loading = useEvidences((s) => s.loading)
  const error = useEvidences((s) => s.error)

  // ============================
  // UI STATE HOOKS (harus di atas, sebelum return kondisi)
  // ============================
  const [active, setActive] = useState(STAGES[0].key)
  const [editOpen, setEditOpen] = useState(false)
  const [openStage, setOpenStage] = useState(null)

  // Pagination acquisition photos
  const [page, setPage] = useState(1)

  // Pagination analysis reports
  const [reportPage, setReportPage] = useState(1)

  // investigation tools untuk modal
  const [investigationTools, setInvestigationTools] = useState(null)

  // NotesBox state
  const [notesValue, setNotesValue] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const savingRef = useRef(false)

  // ============================
  // FETCH DETAIL DARI IPC
  // ============================
  useEffect(() => {
    if (evidenceId) {
      fetchEvidenceDetail(evidenceId)
    }
  }, [evidenceId, fetchEvidenceDetail])

  // ============================
  // DERIVE DATA DARI detail (tidak pakai hook)
  // ============================
  let evidence = null
  let caseRef = null
  let personRef = null

  let chain = {
    acquisition: [],
    preparation: [],
    extraction: [],
    analysis: []
  }

  if (detail) {
    const data = detail
    console.log('Data ', data)
    evidence = {
      id: data.id,
      evidence_number: data.evidence_number,
      summary: data.description,
      source: data.source,
      investigator: data.investigator,
      previewUrl: BACKEND_BASE + '/' + data.file_path,
      previewDataUrl: BACKEND_BASE + '/' + data.file_path,
      createdAt: data.created_at
    }

    caseRef = {
      id: data.case_id,
      name: data.case_name
    }

    personRef = {
      id: data.suspect_id,
      name: data.suspect_name,
      status: data.suspect_status
    }
    // build chain dari custody_reports
    chain = {
      acquisition: [],
      preparation: [],
      extraction: [],
      analysis: []
    }

    for (const r of data.custody_reports || []) {
      // Acquisition
      if (r.custody_type === 'acquisition') {
        chain.acquisition.push({
          title: data.title,
          steps: (Array.isArray(r.details) ? r.details : []).map((d) => ({
            desc: d.steps
          })),
          photos: (Array.isArray(r.details) ? r.details : []).map((d) => d.photo),
          notes: r.notes,
          investigator: r.investigator,
          location: r.location,
          createdAt: r.created_at,
          source: r.evidence_source,
          type: r.evidence_type,
          detail: r.evidence_detail,
          id: r.id
        })
      }

      // Preparation
      if (r.custody_type === 'preparation') {
        chain.preparation.push({
          pairs: (Array.isArray(r.details) ? r.details : []).map((d) => ({
            investigation: d.hypothesis,
            tools: d.tools
          })),
          notes: r.notes,
          investigator: r.investigator,
          location: r.location,
          createdAt: r.created_at,
          source: r.evidence_source,
          type: r.evidence_type,
          detail: r.evidence_detail,
          id: r.id
        })
      }

      // Extraction
      if (r.custody_type === 'extraction') {
        const d = r.details || {}
        chain.extraction.push({
          files: [
            {
              name: d.file_name,
              size: d.file_size,
              base64: d.extraction_file // di UI diperlakukan seperti dataURL, tapi di sini string path juga oke
            }
          ],
          notes: r.notes,
          investigator: r.investigator,
          location: r.location,
          createdAt: r.created_at,
          source: r.evidence_source,
          type: r.evidence_type,
          detail: r.evidence_detail,
          id: r.id
        })
      }

      // Analysis
      if (r.custody_type === 'analysis') {
        const details = r.details || {}
        const results = details.results || []
        const files = details.files || []

        chain.analysis.push({
          details: {
            results: results.map((d) => ({
              hypothesis: d.hypothesis,
              tools: d.tools,
              result: d.result
            })),
            files: files.map((f) => ({
              file_name: f.file_name,
              file_size: f.file_size,
              file_path: BACKEND_BASE + '/' + f.file_path,
              base64: f.file_path
            }))
          },
          notes: r.notes,
          investigator: r.investigator,
          location: r.location,
          createdAt: r.created_at,
          source: r.evidence_source,
          type: r.evidence_type,
          detail: r.evidence_detail,
          id: r.id
        })
      }
    }
  }

  // ============================
  // DERIVED VAR DARI chain & evidence
  // ============================
  const contents = chain?.[active] ?? []
  const latest = Array.isArray(contents) ? contents[contents.length - 1] || null : contents || null

  const headerMeta = useMemo(() => {
    const d = new Date(evidence?.createdAt || Date.now())
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(d.getFullYear()).slice(-2)}`
    return { date }
  }, [evidence?.createdAt])

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
      investigator: last?.investigator || '',
      notes: last?.notes
    }
  })

  const headingInvestigator = evidence?.investigator || latest?.investigator || '-'

  const notesActionLabel = isEditingNotes ? 'Save' : notesValue.trim() ? 'Edit' : 'Add'
  const notesActionIcon = isEditingNotes ? (
    <FaRegSave className="text-[16px]" />
  ) : (
    <LiaEditSolid className="text-[18px]" />
  )

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

  // Pagination derived
  const totalPages = latest?.photos?.length || 0
  const currentImg = totalPages > 0 ? BACKEND_BASE + '/' + latest?.photos[page - 1] : null

  const totalReports = Array.isArray(latest?.details?.files) ? latest?.details?.files.length : 0
  const currentReport = totalReports > 0 ? latest?.details?.files[reportPage - 1] : null

  // ============================
  // EFFECTS LANJUTAN
  // ============================
  // reset pagination saat pindah tab
  useEffect(() => {
    setPage(1)
    setReportPage(1)
  }, [active])

  // investigation tools dari chain.preparation
  useEffect(() => {
    setInvestigationTools(chain.preparation)
  }, [detail]) // cukup bergantung pada detail; chain akan ikut berubah

  // sinkron notes dengan latest content
  // Sync notes only when not editing
  useEffect(() => {
    if (isEditingNotes) return

    if (!latest) {
      setNotesValue('')
      return
    }

    setNotesValue(latest.notes || '')
  }, [active, latest, isEditingNotes])

  // ============================
  // HELPERS
  // ============================
  async function handleSubmitStage(stage, payload) {
    const numericId = detail.id

    try {
      if (stage === 'acquisition') {
        await createCustodyAcquisition(numericId, {
          investigator: payload.investigator,
          location: payload.location,
          source: payload.source,
          type: payload.type,
          detail: payload.detail,
          notes: payload.notes,
          steps: payload.steps
        })
      } else if (stage === 'preparation') {
        await createCustodyPreparation(numericId, {
          investigator: payload.investigator,
          location: payload.location,
          source: payload.source,
          type: payload.type,
          detail: payload.detail,
          notes: payload.notes,
          pairs: payload.pairs
        })
      } else if (stage === 'extraction') {
        await createCustodyExtraction(numericId, {
          investigator: payload.investigator,
          location: payload.location,
          source: payload.source,
          type: payload.type,
          detail: payload.detail,
          notes: payload.notes,

          // EXTRACTION memang pakai payload.files
          files: payload.files
        })
      } // EvidenceDetailPage.jsx
      else if (stage === 'analysis') {
        const files = payload.reports.map((r) => ({
          name: r.name,
          mime: r.type,
          base64: r.base64
        }))

        await createCustodyAnalysis(numericId, {
          investigator: payload.investigator,
          location: payload.location,
          source: payload.source,
          type: payload.type,
          detail: payload.detail,
          notes: payload.notes,
          analysisPairs: payload.analysisPairs,
          files // ← kirim base64 di sini
        })
      }

      await fetchEvidenceDetail(numericId)
    } catch (err) {
      console.error('submit stage error', err)
    }
  }

  const onNotesAction = async () => {
    if (!isEditingNotes) {
      setIsEditingNotes(true)
      return
    }

    if (savingRef.current) return
    savingRef.current = true

    try {
      const text = notesValue.trim()

      const stageList = chain[active] || []
      const latestReport = stageList[stageList.length - 1]
      console.log(latestReport)
      if (!latestReport?.id) {
        console.error('No custody report ID detected for stage:', active)
        setIsEditingNotes(false)
        return
      }

      await updateCustodyNotes(detail.id, latestReport.id, text)

      await fetchEvidenceDetail(detail.id)

      setIsEditingNotes(false)
    } catch (err) {
      console.error('Failed updating notes:', err)
    } finally {
      savingRef.current = false
    }
  }

  async function downloadReport(file) {
    console.log('file : ', file)
    if (!file?.base64) {
      toast.error('File path not found')
      return
    }

    const res = await window.api.invoke('evidence:downloadFile', file.base64)

    if (res.error) {
      toast.error(res.message)
      return
    }

    toast.success(`Saved to Downloads`)
  }

  function approxSizeLabel(dataUrl) {
    if (!dataUrl) return '-'
    const b64 = dataUrl.split(',')[1] || ''
    const bytes =
      Math.ceil((b64.length * 3) / 4) - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0)
    const mb = bytes / (1024 * 1024)
    return mb >= 0.5 ? `${mb.toFixed(0)} Mb` : `${(bytes / 1024).toFixed(0)} Kb`
  }

  async function downloadEvidencePdf(evidenceId) {
    const res = await window.api.invoke('evidence:exportPdf', evidenceId)

    if (res.error) {
      alert(res.message)
      return
    }

    toast.success('PDF exported successfully. Please check your Downloads folder.')
  }

  // ============================
  // EARLY RETURN SETELAH SEMUA HOOK
  // (AMAN UNTUK RULES OF HOOKS)
  // ============================
  if (loading && !detail) {
    return (
      <CaseLayout title="Evidence Management" showBack={true}>
        <div className="p-6 text-center opacity-70">Loading evidence detail...</div>
      </CaseLayout>
    )
  }

  if (error && !detail) {
    return (
      <CaseLayout title="Evidence Management" showBack={true}>
        <div className="p-6">
          <div className="mb-4">
            <button className="btn" onClick={() => nav(-1)}>
              ← Back
            </button>
          </div>
          <div className="text-sm opacity-70">Failed to load evidence detail: {error}</div>
        </div>
      </CaseLayout>
    )
  }

  if (!detail || !evidence) {
    return (
      <CaseLayout title="Evidence Management" showBack={true}>
        <div className="p-6">
          <div className="mb-4">
            <button className="btn" onClick={() => nav(-1)}>
              ← Back
            </button>
          </div>
          <div className="text-sm opacity-70">Evidence not found.</div>
        </div>
      </CaseLayout>
    )
  }
  console.log('caseref : ', caseRef)

  // ============================
  // NORMAL RENDER
  // ============================
  return (
    <CaseLayout title="Evidence Management" showBack={true}>
      <div className="mx-auto py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold mb-1">{evidence.evidence_number}</h1>
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
            <MiniButton onClick={() => downloadEvidencePdf(evidence.id)}>
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
                Preservation
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
                <div key={m.key} className="flex flex-col items-center text-center gap-1">
                  <div className="text-lg font-semibold mb-1">{m.label}</div>
                  {m.date && <div className="text-sm opacity-60">{m.date}</div>}
                  {m.investigator && <div className="text-sm ">{m.investigator}</div>}
                  {m.notes && (
                    <div className="opacity-60 text-[13px] truncate max-w-[220px]" title={m.notes}>
                      notes : {m.notes}
                    </div>
                  )}
                  {!(m.date || m.investigator || m.notes) && <div>Not Recorded</div>}
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
                        {'Steps for Confiscating Evidence : '}
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
                    {latest?.files?.[0] ? (
                      <>
                        <div className="absolute -mt-8 text-center">
                          <p
                            title={latest.files[0].name}
                            className="font-bold truncate max-w-[130px]"
                          >
                            {latest.files[0].name}
                          </p>
                          <p>
                            Size : {latest.files[0].size || approxSizeLabel(latest.files[0].base64)}
                          </p>
                        </div>
                        <button
                          className="absolute bg-[#2A3A51] px-5 mt-32 border-y-black border border-x-0"
                          onClick={() => downloadReport(latest.files[0])}
                        >
                          Download
                        </button>
                      </>
                    ) : (
                      <div className="absolute text-center -mt-5 text-[#A5B1C2]">
                        No extraction file uploaded.
                      </div>
                    )}
                  </div>
                )}

                {active === 'analysis' && showContent && (
                  <div className="flex flex-row justify-between gap-8">
                    {/* ===========================
                          LEFT — ANALYSIS RESULTS
                        =========================== */}
                    <div>
                      <div className="text-lg font-semibold mb-3">Analysis Result:</div>
                      <ol className="list-decimal pl-6 text-base leading-relaxed space-y-3">
                        {(latest?.details?.results || []).map((p, i) => (
                          <li key={i} className="space-y-1">
                            <div className="whitespace-pre-wrap">{p.result || '-'}</div>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* =================================
                          RIGHT — REPORT FILES DISPLAY
                      ================================= */}
                    <div className="md:justify-self-end">
                      <BoxAllSide>
                        <BoxAllSide>
                          <div className="flex flex-row justify-center items-center gap-5">
                            <img src={iconReport} alt="report" className="w-[30px] h-[30px]" />
                            <div className="flex flex-col">
                              <p
                                title={currentReport?.file_name}
                                className="font-bold truncate max-w-[150px]"
                              >
                                {currentReport?.file_name || 'No Report'}
                              </p>
                              <p>Size : {currentReport?.file_size || '-'}</p>
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

                      {/* Pagination */}
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
                    onChange={(v) => setNotesValue(v)}
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
          evidenceData={evidence}
          caseName={caseRef?.name}
          personData={personRef}
          onSave={async (updated) => {
            await updateEvidenceRemote(detail.id, {
              payload: {
                source: updated.source,
                evidence_summary: updated.summary,
                investigator: updated.investigator,

                is_unknown_person: updated.poiMode === 'unknown',
                person_name: updated.poiMode === 'unknown' ? undefined : updated.personName?.trim(),
                suspect_status:
                  updated.poiMode === 'unknown' ? undefined : updated.status || undefined,

                evidence_file: updated.file || undefined,

                suspect_id: personRef?.id || undefined
              }
            })
            setEditOpen(false)
          }}
        />
      </div>
    </CaseLayout>
  )
}
