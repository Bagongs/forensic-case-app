import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCases } from '../store/cases'
import AddPersonInlineModal from '../components/AddPersonInlineModal'
import ChangeStatusModal from '../components/ChangeStatusModal'
import EditCaseModal from '../components/EditCaseModal'
import EditPersonModal from '../components/EditPersonModal'
import AddEvidenceModal from '../components/AddEvidenceModal'
import CaseLayout from './CaseLayout'
import MiniButton, { MiniButtonContent } from '../components/MiniButton'
import bgButton from '../assets/image/bg-button.svg'
import bgButtonTransparent from '../assets/image/bg-button-transparent.svg'
import NotesBox from '../components/NotesBox'
import CaseLogBox from '../components/CaseLogBox'
import { PersonSectionBox } from '../components/PersonSectionBox'
import { PersonBox } from '../components/PersonBox'
import { EvidenceCard } from '../components/EvidanceCard'
import ExactSvgCutBox from '../components/common/ExactSvgCutBox'
import { FaEdit, FaRegSave } from 'react-icons/fa'
import { LiaEditSolid } from 'react-icons/lia'
import editBg from '../assets/image/edit.svg'

const fmtDate = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

const mapLogs = (logs = []) =>
  logs
    .slice()
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .map((l) => ({
      status: l.type,
      by: l.by || undefined,
      date: fmtDate(l.at),
      change: l.note || undefined,
      hasNotes: !!l.note
    }))

export default function CaseDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()

  // store selectors
  const getCaseById = useCases((s) => s.getCaseById)
  const addNote = useCases((s) => s.addNote)
  const updateCase = useCases((s) => s.updateCase)
  const updatePerson = useCases((s) => s.updatePerson)
  const addEvidenceToPerson = useCases((s) => s.addEvidenceToPerson)

  // ambil data case
  const item = getCaseById?.(id)

  // local state
  const [editPersonOpen, setEditPersonOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [addPersonOpen, setAddPersonOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [summary, setSummary] = useState(item?.summary || '')
  const [openAddEv, setOpenAddEv] = useState(false)
  const [personForEvidence, setPersonForEvidence] = useState(null)
  const savingRef = useRef(false)

  const logs = useMemo(() => mapLogs(item?.logs || []), [item?.logs])

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
  }, [item])

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
        <div className="opacity-70">Case not found.</div>
      </div>
    )
  }

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
      updateCase(item.id, { summary })
    } catch (e) {
      console.log(e)
    } finally {
      savingRef.current = false
    }
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

          <MiniButton>
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
                    color: '#C3CFE0',
                    fontSize: titleFontSize,
                    fontWeight: 600,
                    marginBottom: contentSpacing
                  }}
                >
                  Case description
                </div>
                <p className="text-base leading-relaxed text-[#E7E9EE]">
                  {item.description || 'No description.'}
                </p>
              </>
            )}
          </ExactSvgCutBox>

          {/* PERSONS SECTION */}
          <PersonSectionBox
            title="Person of Interest"
            total={item.persons.length}
            borderColor="#FFFFFF"
            actionBgImage={bgButtonTransparent}
            onAddPerson={() => setAddPersonOpen(true)}
          >
            {item.persons.map((person, i) => (
              <PersonBox
                key={i}
                name={person.name}
                roleLabel={person.status}
                actionBgImage={bgButton}
                onEdit={() => {
                  setSelectedPerson(person)
                  setEditPersonOpen(true)
                }}
                onAddEvidence={() => {
                  setPersonForEvidence(person)
                  setOpenAddEv(true)
                }}
              >
                {person.evidences.map((ev, j) => (
                  <EvidenceCard
                    key={j}
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
          </PersonSectionBox>
        </div>

        {/* RIGHT SIDE */}
        <aside>
          <CaseLogBox
            title="Case Log"
            logs={logs}
            actionLabel="Change"
            onAction={() => setStatusOpen(true)}
          />
        </aside>

        {/* SUMMARY */}
        <NotesBox
          title="Summary"
          value={summary}
          onChange={setSummary}
          placeholder="Click Add to write summary"
          editable={isEditing}
          actionLabel={actionLabel}
          actionIcon={actionIcon}
          actionBgImage={editBg}
          actionSize={{ w: 70, h: 27 }}
          actionOffset={{ top: 22, right: 24 }}
          onAction={onSummaryAction}
        />
      </div>

      {/* MODALS */}
      <AddPersonInlineModal
        caseId={item.id}
        open={addPersonOpen}
        onClose={() => setAddPersonOpen(false)}
      />

      <ChangeStatusModal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        caseId={item.id}
        currentStatus={item.status}
        author={item.investigator || ''}
      />

      <EditCaseModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={item}
        onSave={(patch) => {
          updateCase(item.id, patch, item.investigator || '')
          setEditOpen(false)
        }}
      />

      <EditPersonModal
        open={editPersonOpen}
        onClose={() => setEditPersonOpen(false)}
        caseId={item.id}
        person={selectedPerson}
        author={item.investigator || ''}
      />

      {openAddEv && personForEvidence && (
        <AddEvidenceModal
          open={openAddEv}
          onClose={() => {
            setOpenAddEv(false)
            setPersonForEvidence(null)
          }}
          onSave={(data) => {
            addEvidenceToPerson(item.id, personForEvidence.id, data)
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
