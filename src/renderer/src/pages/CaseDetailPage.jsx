/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCases } from '../store/cases'
import { PersonSectionBox } from '../components/box/PersonSectionBox'
import { PersonBox } from '../components/box/PersonBox'
import { EvidenceCard } from '../components/EvidanceCard'
import { FaEdit, FaRegSave } from 'react-icons/fa'
import { LiaEditSolid } from 'react-icons/lia'
import { BoxAllSideWithTopLeftSlanted } from '../components/box/BaseBox'
import MiniButton, { MiniButtonContent } from '../components/common/MiniButton'
import AddPersonInlineModal from '../components/modals/suspect/AddPersonInlineModal'
import ChangeStatusModal from '../components/modals/case/ChangeStatusModal'
import EditCaseModal from '../components/modals/case/EditCaseModal'
import EditPersonModal from '../components/modals/suspect/EditPersonModal'
import AddEvidenceModal from '../components/modals/evidence/AddEvidenceModal'
import CaseLayout from './CaseLayout'
import NotesBox from '../components/box/NotesBox'
import CaseLogBox from '../components/box/CaseLogBox'
import bgButton from '../assets/image/bg-button.svg'
import bgButtonTransparent from '../assets/image/bg-button-transparent.svg'
import editBg from '../assets/image/edit.svg'
import upperCard from '../assets/image/upper-card.svg'
import NotesModal from '../components/modals/case/NotesModal'
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal'
import toast from 'react-hot-toast'
import AllLogsModal from '../components/modals/case/DetailCaseLogsModal'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6'

const fmtDate = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}
function ClampText({ text, step = 5 }) {
  const [visibleLines, setVisibleLines] = useState(step)
  const [totalLines, setTotalLines] = useState(step)
  const [expandedAll, setExpandedAll] = useState(false)
  const hiddenRef = useRef(null)

  // hitung jumlah line real
  useLayoutEffect(() => {
    if (!hiddenRef.current) return

    const el = hiddenRef.current
    const style = window.getComputedStyle(el)
    const lineHeight = parseFloat(style.lineHeight)

    const height = el.getBoundingClientRect().height
    const lines = Math.round(height / lineHeight)

    setTotalLines(lines)
  }, [text])

  const handleToggle = () => {
    if (!expandedAll) {
      // expand full
      setVisibleLines(totalLines)
      setExpandedAll(true)
    } else {
      // collapse back to step
      setVisibleLines(step)
      setExpandedAll(false)
    }
  }

  return (
    <div>
      {/* Hidden measurement */}
      <p
        ref={hiddenRef}
        className="text-base absolute opacity-0 pointer-events-none -z-50"
        style={{ position: 'absolute', visibility: 'hidden' }}
      >
        {text}
      </p>

      {/* Visible text */}
      <p
        className="text-base transition-all"
        style={
          expandedAll
            ? { overflow: 'visible' } // FULL TEXT
            : {
                display: '-webkit-box',
                WebkitLineClamp: visibleLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }
        }
      >
        {text}
      </p>

      {/* Show more/less ONLY if needed */}
      {totalLines > step && (
        <button
          onClick={handleToggle}
          className="mt-2 text-sm font-semibold text-[#EDC702] hover:underline flex items-center gap-2"
        >
          {expandedAll ? (
            <>
              <FaChevronUp size={12} /> Show less
            </>
          ) : (
            <>
              <FaChevronDown size={12} /> Show more
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()

  const rawCaseId = Number(id)
  const caseId = Number.isFinite(rawCaseId) ? rawCaseId : null

  // ===== store selectors =====
  const getCaseById = useCases((s) => s.getCaseById)
  const fetchCaseDetail = useCases((s) => s.fetchCaseDetail)
  const fetchCaseLogs = useCases((s) => s.fetchCaseLogs)
  const updateCaseRemote = useCases((s) => s.updateCaseRemote)
  const saveCaseNotesRemote = useCases((s) => s.saveCaseNotesRemote)
  const editCaseNotesRemote = useCases((s) => s.editCaseNotesRemote)
  const deletePersonRemote = useCases((s) => s.deletePersonRemote)

  const caseLogsMap = useCases((s) => s.caseLogs)
  const loading = useCases((s) => s.loading)
  const error = useCases((s) => s.error)

  // data dari store (bisa list-shape atau detail-shape)
  const item = caseId ? getCaseById?.(caseId) : null

  // ===== local states =====
  const [selectedPersonId, setSelectedPersonId] = useState(null)
  const [addPersonOpen, setAddPersonOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(item?.notes || '')

  const [openAddEv, setOpenAddEv] = useState(false)
  const [personForEvidence, setPersonForEvidence] = useState(null)

  const [noteOpen, setNoteOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState('')

  const [editPersonOpen, setEditPersonOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const savingRef = useRef(false)
  const fetchedDetailRef = useRef(null) // prevent double fetch
  const [logsModal, setLogsModal] = useState(false)
  const [allLogs, setAllLogs] = useState([])

  // selected person from fresh store
  const selectedPerson = useCases((s) =>
    caseId
      ? s.getCaseById(caseId)?.persons?.find((p) => Number(p.id) === Number(selectedPersonId))
      : null
  )

  // ===== side effects =====

  // ✅ ALWAYS fetch detail when entering page / caseId changes
  useEffect(() => {
    if (!caseId) return
    if (fetchedDetailRef.current === caseId) return
    fetchedDetailRef.current = caseId
    fetchCaseDetail(caseId).catch(() => {})
  }, [caseId])

  // fetch logs on caseId change
  useEffect(() => {
    if (!caseId) return
    fetchCaseLogs(caseId, { skip: 0, limit: 50 }).catch(() => {})
  }, [caseId])

  // sync notes local if backend updates
  useEffect(() => {
    setNotes(item?.notes || '')
  }, [item?.notes])

  // ===== logs view =====
  const logsRaw = (caseId && caseLogsMap?.[caseId]) || []
  const logs = useMemo(
    () =>
      logsRaw
        .slice()
        .sort((a, b) => {
          const da = new Date(a.rawDate || a.date)
          const db = new Date(b.rawDate || b.date)
          return db - da
        })
        .map((l) => ({
          status: l.status,
          by: l.by || undefined,
          date: fmtDate(l.rawDate || l.date),
          change: l.change || undefined,
          hasNotes: !!l.notes,
          notes: l.notes
        })),
    [logsRaw]
  )

  // ===== status chip =====
  const statChip = useMemo(() => {
    if (!item) return null
    const statusRaw = item.status || 'Open'
    const status = String(statusRaw)
    const COLORS = {
      Open: { bg: '#103300', border: '#42D200', text: '#42D200' },
      Closed: { bg: '#330006', border: '#FF0221', text: '#FF0221' },
      'Re-open': { bg: '#664C00', border: '#FFC720', text: '#FFC720' },
      Reopen: { bg: '#664C00', border: '#FFC720', text: '#FFC720' },
      'Re-Open': { bg: '#664C00', border: '#FFC720', text: '#FFC720' }
    }
    const color = COLORS[status] || COLORS.Open

    return (
      <span
        className="px-5 py-1.5 min-w-28 rounded-full border text-xs font-medium select-none text-center"
        style={{
          backgroundColor: color.bg,
          borderColor: color.border,
          color: color.text
        }}
      >
        {status}
      </span>
    )
  }, [item?.status])

  const actionLabel = isEditing ? 'Save' : notes.trim() ? 'Edit' : 'Add'
  const actionIcon = isEditing ? (
    <FaRegSave className="text-[16px]" />
  ) : (
    <LiaEditSolid className="text-[18px]" />
  )

  // ===== Notes Save/Edit =====
  const onNotesAction = async () => {
    if (!item) return

    if (!isEditing) {
      setIsEditing(true)
      return
    }
    if (savingRef.current) return
    savingRef.current = true

    try {
      const trimmed = (notes ?? '').trim()
      setIsEditing(false)

      if (!item.notes) {
        await saveCaseNotesRemote(item.id, trimmed)
      } else {
        await editCaseNotesRemote(item.id, trimmed)
      }
    } finally {
      savingRef.current = false
    }
  }

  // ===== Export PDF =====
  async function downloadCasePdf(caseId) {
    const res = await window.api.invoke('cases:exportPdf', caseId)

    if (res.error) {
      alert(res.message)
      return
    }

    toast.success('PDF exported successfully. Please check your Downloads folder.')
  }

  /* ============================================================
     RENDER EMPTY / LOADING
  ============================================================ */
  if (!caseId) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button
          className="px-3 py-1.5 rounded-lg border mb-4"
          style={{ borderColor: 'var(--border)' }}
          onClick={() => nav('/cases')}
        >
          Back
        </button>
        <div className="opacity-70">Invalid Case ID.</div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button
          className="px-3 py-1.5 rounded-lg border mb-4"
          style={{ borderColor: 'var(--border)' }}
          onClick={() => nav('/cases')}
        >
          Back
        </button>
        {loading ? (
          <div className="opacity-70">Loading case…</div>
        ) : (
          <div className="opacity-70">{error ? String(error) : 'Case not found.'}</div>
        )}
      </div>
    )
  }

  const persons = item.persons || []
  const headerCaseNumber = item.caseNumber || item.case_number || item.caseNumberText || item.id
  return (
    <CaseLayout title="Case Management" showBack={true}>
      {/* HEADER */}
      <div className="flex mt-8 items-start justify-between gap-10">
        <div className="flex flex-col gap-2">
          <div className="text-xs opacity-70">{headerCaseNumber}</div>

          <div>
            <div className="text-3xl font-semibold flex items-center gap-3">
              {item.name} {statChip}
            </div>
            <div className="text-sm opacity-70 mt-1">
              {item.investigator ? `${item.investigator} • ` : ''}
              {fmtDate(item.createdAt)}
            </div>
          </div>

          <div className="text-sm opacity-70 mt-1">
            Agency: {item.agency || '-'} &nbsp;&nbsp; Work Unit: {item.workUnit || '-'}
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

          <MiniButton onClick={() => downloadCasePdf(caseId)}>
            <MiniButtonContent bg={bgButton} text="+ Export PDF" textColor="text-black" />
          </MiniButton>
        </div>
      </div>

      <div className="my-5 border-t" style={{ borderColor: '#C3CFE0' }} />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          {/* DESCRIPTION */}
          <div className="relative">
            <img src={upperCard} className="absolute -z-10 right-24 w-3/4 top-5" />

            <BoxAllSideWithTopLeftSlanted
              slantWidth={180}
              slantHeight={50}
              borderColor="#C3CFE0"
              bg="#111720"
            >
              <div className="flex flex-col gap-5">
                <p className="text-xl font-bold capitalize">Case description</p>

                <ClampText text={item.description || 'No description.'} lines={5} />
              </div>
            </BoxAllSideWithTopLeftSlanted>
          </div>

          {/* PERSON SECTION */}
          <PersonSectionBox
            title="Person of Interest"
            total={persons.length}
            borderColor="#FFFFFF"
            actionBgImage={bgButtonTransparent}
            onAddPerson={() => setAddPersonOpen(true)}
          >
            {persons.map((person) => {
              const evidences = person.evidences || []
              return (
                <PersonBox
                  key={person.id}
                  name={person.name}
                  roleLabel={person.status}
                  actionBgImage={bgButton}
                  onEdit={() => {
                    setSelectedPersonId(person.id)
                    setEditPersonOpen(true)
                  }}
                  onAddEvidence={() => {
                    setPersonForEvidence(person)
                    setOpenAddEv(true)
                  }}
                >
                  {evidences.map((ev) => {
                    const img = ev.previewDataUrl || ev.image || ev.previewUrl || null

                    return (
                      <EvidenceCard
                        key={ev.id}
                        image={img}
                        code={ev.fileName || ev.evidenceNumber || ev.id}
                        summary={ev.summary}
                        onClick={() => nav(`/evidence/${ev.id}`)}
                      />
                    )
                  })}

                  {evidences.length === 0 && (
                    <div className="text-sm text-[#888F99]">No evidence added.</div>
                  )}
                </PersonBox>
              )
            })}

            {persons.length === 0 && (
              <div className="text-center text-sm opacity-70 py-8">No Person of Interest</div>
            )}
          </PersonSectionBox>
        </div>

        {/* RIGHT SIDE */}
        <aside>
          <CaseLogBox
            title="Case Log"
            logs={logs}
            actionLabel="Change"
            onAction={() => setStatusOpen(true)}
            onViewNotes={(log) => {
              setSelectedNote(log.note || log.change || 'No notes found')
              setNoteOpen(true)
            }}
            onSeeMore={(logs) => {
              setAllLogs(logs)
              setLogsModal(true)
            }}
          />

          <AllLogsModal open={logsModal} onClose={() => setLogsModal(false)} logs={allLogs} />

          {noteOpen && (
            <NotesModal open={noteOpen} onClose={() => setNoteOpen(false)} notes={selectedNote} />
          )}
        </aside>
      </div>

      {/* NOTES */}
      <div className="flex w-full mt-5">
        <NotesBox
          title="Notes"
          value={notes}
          onChange={setNotes}
          placeholder="Click Add to write notes"
          editable={isEditing}
          actionLabel={actionLabel}
          actionIcon={actionIcon}
          actionBgImage={editBg}
          actionSize={{ w: 70, h: 27 }}
          actionOffset={{ top: 22, right: 24 }}
          onAction={onNotesAction}
          maxBodyHeight={240}
          autoGrow={false}
        />
      </div>

      {/* ============= MODALS ============= */}

      {addPersonOpen && (
        <AddPersonInlineModal
          caseId={item.id}
          open={addPersonOpen}
          onClose={() => setAddPersonOpen(false)}
        />
      )}

      {statusOpen && (
        <ChangeStatusModal
          open={statusOpen}
          onClose={() => setStatusOpen(false)}
          caseId={item.id}
          currentStatus={item.status}
          author={item.investigator || ''}
          onChanged={async () => {
            await fetchCaseDetail(item.id)
            await fetchCaseLogs(item.id, { skip: 0, limit: 50 })
          }}
        />
      )}

      {editOpen && (
        <EditCaseModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initial={item}
          onSave={async (patch) => {
            await updateCaseRemote(item.id, patch)
            ;(setEditOpen(false), await fetchCaseDetail(item.id))
            await fetchCaseLogs(item.id, { skip: 0, limit: 50 })
          }}
        />
      )}

      {editPersonOpen && selectedPerson && (
        <EditPersonModal
          open={editPersonOpen}
          onClose={() => setEditPersonOpen(false)}
          caseId={item.id}
          person={selectedPerson}
          author={item.investigator || ''}
          showDelete={true}
          onRequestDelete={() => {
            setConfirmDeleteOpen(true)
            setEditPersonOpen(false)
          }}
        />
      )}

      {confirmDeleteOpen && selectedPerson && (
        <ConfirmDeleteModal
          open={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          name={selectedPerson?.name}
          onConfirm={async () => {
            await deletePersonRemote(item.id, selectedPersonId)

            setConfirmDeleteOpen(false)
            setEditPersonOpen(false)
            setSelectedPersonId(null)

            await fetchCaseLogs(item.id, { skip: 0, limit: 50 })
          }}
          colorIcon="red"
        />
      )}

      {openAddEv && personForEvidence && (
        <AddEvidenceModal
          open={openAddEv}
          onClose={() => {
            setOpenAddEv(false)
            setPersonForEvidence(null)
          }}
          onSave={async () => {
            await fetchCaseDetail(item.id)
            await fetchCaseLogs(item.id, { skip: 0, limit: 50 })

            setOpenAddEv(false)
            setPersonForEvidence(null)
          }}
          defaultCaseId={item.id}
          defaultCaseName={item.name}
          defaultInvestigator={item.investigator}
          defaultPerson={personForEvidence}
        />
      )}
    </CaseLayout>
  )
}
