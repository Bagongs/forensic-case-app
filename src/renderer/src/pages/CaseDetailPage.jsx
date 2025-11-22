/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCases } from '../store/cases'

import AddPersonInlineModal from '../components/modals/suspect/AddPersonInlineModal'
import ChangeStatusModal from '../components/modals/case/ChangeStatusModal'
import EditCaseModal from '../components/modals/case/EditCaseModal'
import EditPersonModal from '../components/modals/suspect/EditPersonModal'
import AddEvidenceModal from '../components/modals/evidence/AddEvidenceModal'

import CaseLayout from './CaseLayout'
import MiniButton, { MiniButtonContent } from '../components/common/MiniButton'
import NotesBox from '../components/box/NotesBox'
import CaseLogBox from '../components/box/CaseLogBox'
import { PersonSectionBox } from '../components/box/PersonSectionBox'
import { PersonBox } from '../components/box/PersonBox'
import { EvidenceCard } from '../components/EvidanceCard'
import ExactSvgCutBox from '../components/box/ExactSvgCutBox'

import { FaEdit, FaRegSave } from 'react-icons/fa'
import { LiaEditSolid } from 'react-icons/lia'

import bgButton from '../assets/image/bg-button.svg'
import bgButtonTransparent from '../assets/image/bg-button-transparent.svg'
import editBg from '../assets/image/edit.svg'

import NotesModal from '../components/modals/case/NotesModal'
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal'

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

export default function CaseDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()

  const rawCaseId = Number(id)
  const caseId = Number.isFinite(rawCaseId) ? rawCaseId : null

  // ===== store selectors (FINAL) =====
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

  // data dari store
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

  // selected person (fresh dari store) — aman tipe string/number
  const selectedPerson = useCases((s) =>
    caseId
      ? s.getCaseById(caseId)?.persons?.find((p) => Number(p.id) === Number(selectedPersonId))
      : null
  )

  // ===== side effects =====

  // 1) fetch detail saat mount / id berubah (hindari double fetch)
  useEffect(() => {
    if (!caseId) return
    if (!item) fetchCaseDetail(caseId).catch(() => {})
  }, [caseId, item])

  // 2) fetch logs saat id berubah
  useEffect(() => {
    if (!caseId) return
    fetchCaseLogs(caseId, { skip: 0, limit: 50 }).catch(() => {})
  }, [caseId])

  // 3) sync notes local kalau backend update
  useEffect(() => {
    setNotes(item?.notes || '')
  }, [item?.notes])

  // ===== logs view =====
  const logsRaw = (caseId && caseLogsMap?.[caseId]) || []
  const logs = useMemo(
    () =>
      logsRaw
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((l) => ({
          status: l.status,
          by: l.by || undefined,
          date: fmtDate(l.date),
          change: l.notes || l.change || undefined,
          hasNotes: !!l.notes,
          note: l.notes
        })),
    [logsRaw]
  )

  // ===== status chip =====
  const statChip = useMemo(() => {
    if (!item) return null
    const status = item.status || 'Open'
    const COLORS = {
      Open: { bg: '#103300', border: '#42D200', text: '#42D200' },
      Closed: { bg: '#330006', border: '#FF0221', text: '#FF0221' },
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

  const PATH_D = `
M368.22 0.75
L429.666 56.8008
L429.881 56.9961
H1276.12
L1290.25 70.9805
V304.737
L1276.13 318.25
H14.875
L0.75 304.265
V14.7344
L14.875 0.75
H368.22
Z`.trim()

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
      const trimmed = notes.trim()
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
  const onExportPdf = async () => {
    if (!item) return
    try {
      const res = await window.api.invoke('cases:exportPdf', item.id)
      if (res?.error) throw new Error(res.message)
      console.log('PDF ready:', res?.filename || res)
      // TODO: tampilkan toast / save dialog
    } catch (e) {
      console.error('Export PDF failed:', e)
      // TODO: tampilkan toast error
    }
  }

  // ===== render empty / loading =====
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

  return (
    <CaseLayout title="Case Management" showBack={true}>
      {/* HEADER */}
      <div className="flex mt-8 items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-xs opacity-70">{item.id}</div>

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

          <MiniButton onClick={onExportPdf}>
            <MiniButtonContent bg={bgButton} text="+ Export PDF" textColor="text-black" />
          </MiniButton>
        </div>
      </div>

      <div className="my-5 border-t" style={{ borderColor: '#C3CFE0' }} />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          <ExactSvgCutBox
            pathD={PATH_D}
            paddingX={40}
            titlePaddingTop={41}
            contentSpacing={20}
            titleFontSize={30}
          >
            {({ titleFontSize, contentSpacing }) => (
              <>
                <div
                  className="font-[Aldrich]"
                  style={{
                    fontSize: titleFontSize,
                    fontWeight: 600,
                    marginBottom: contentSpacing
                  }}
                >
                  Case description
                </div>
                <p className="text-2xl pt-5 pb-0 leading-relaxed text-[#CFCFCF]">
                  {item.description || 'No description.'}
                </p>
              </>
            )}
          </ExactSvgCutBox>

          {/* PERSON SECTION */}
          <PersonSectionBox
            title="Person of Interest"
            total={item.persons.length}
            borderColor="#FFFFFF"
            actionBgImage={bgButtonTransparent}
            onAddPerson={() => setAddPersonOpen(true)}
          >
            {item.persons.map((person) => (
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
                {person.evidences.map((ev) => (
                  <EvidenceCard
                    key={ev.id}
                    image={ev.previewDataUrl || ev.image}
                    code={ev.fileName || ev.id}
                    summary={ev.summary}
                  />
                ))}
                {person.evidences.length === 0 && (
                  <div className="text-sm text-[#888F99]">No evidence added.</div>
                )}
              </PersonBox>
            ))}
            {item.persons.length === 0 && <span className="text-center">No Person Interest</span>}
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
          />

          {noteOpen && (
            <NotesModal open={noteOpen} onClose={() => setNoteOpen(false)} notes={selectedNote} />
          )}
        </aside>
      </div>

      {/* SUMMARY / NOTES */}
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
        />
      )}

      {editOpen && (
        <EditCaseModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initial={item}
          onSave={async (patch) => {
            await updateCaseRemote(item.id, patch)
            setEditOpen(false)
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
            // store sudah auto fetchCaseDetail, jadi cukup tutup modal
            setConfirmDeleteOpen(false)
            setEditPersonOpen(false)
            setSelectedPersonId(null)

            // optional refresh logs biar ketarik action delete di Case Log
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
            // ✅ FULL REFRESH setelah add evidence
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
