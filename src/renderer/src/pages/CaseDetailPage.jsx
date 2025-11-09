// src/renderer/src/pages/case/CaseDetailPage.jsx
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCases } from '../store/cases'
import AddPersonInlineModal from '../components/AddPersonInlineModal'
import ChangeStatusModal from '../components/ChangeStatusModal'
import EditCaseModal from '../components/EditCaseModal'
import EditPersonModal from '../components/EditPersonModal'
import CaseLayout from './CaseLayout'
import MiniButton, { MiniButtonContent } from '../components/MiniButton'
import bgButton from '../assets/image/bg-button.svg'
import bgButtonTransparent from '../assets/image/bg-button-transparent.svg'
import SummaryBox from '../components/SummaryBox'
import CaseLogBox from '../components/CaseLogBox'
import { PersonSectionBox } from '../components/PersonSectionBox'
import { PersonBox } from '../components/PersonBox'
import { EvidenceCard } from '../components/EvidanceCard'
import ExactSvgCutBox from '../components/common/ExactSvgCutBox'
import { FaEdit } from 'react-icons/fa'

const fmtDate = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const logs = [
    { status: 'Re-open', date: '16 Mei 2025, 12:00', hasNotes: true },
    {
      status: 'Edit',
      by: 'Wisnu',
      date: '16 Mei 2025, 12:00',
      change: 'Adding person Nathalie'
    },
    {
      status: 'Edit',
      by: 'Wisnu',
      date: '16 Mei 2025, 09:00',
      change: 'Adding evidence 3234222'
    },
    { status: 'Closed', date: '12 Mei 2025, 14:00', hasNotes: true },
    { status: 'Open', date: '9 Mei 2025, 10:00' }
  ]

  // selectors dari store
  const getCaseById = useCases((s) => s.getCaseById)
  const addNote = useCases((s) => s.addNote)
  const updateCase = useCases((s) => s.updateCase)
  const [editPersonOpen, setEditPersonOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)

  const item = getCaseById?.(id)
  const [summary, setSummary] = useState(item?.summary || '')

  const [addPersonOpen, setAddPersonOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const statChip = useMemo(() => {
    if (!item) return null
    return (
      <span
        className="px-5 py-0.5 rounded-full border text-xs"
        style={{ borderColor: 'var(--border)' }}
      >
        {item.status || 'Open'}
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

  return (
    <CaseLayout title="Case Management" showBack={true}>
      <div className="flex mt-8 items-start justify-between">
        <div>
          <div className="text-xs opacity-70">{item.id}</div>
          <div className="text-3xl font-semibold flex items-center gap-3">
            {item.name} {statChip}
          </div>
          <div className="text-sm opacity-70 mt-1">
            {item.investigator ? `${item.investigator} • ` : ''}
            {fmtDate(item.createdAt)}
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
                <p className="text-sm leading-relaxed text-[#E7E9EE]">
                  {item.description || 'No description.'}
                </p>
              </>
            )}
          </ExactSvgCutBox>
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
                roleLabel={person.role}
                roleColor={person.roleColor}
                actionBgImage={bgButton}
                onEdit={() => (setSelectedPerson(person), setEditPersonOpen(true))}
                onAddEvidence={() => console.log('add evidence for', person.name)}
              >
                {person.evidences.map((ev, j) => (
                  <EvidenceCard key={j} image={ev.image} code={ev.code} summary={ev.summary} />
                ))}
              </PersonBox>
            ))}
          </PersonSectionBox>
        </div>
        <aside>
          <CaseLogBox
            title="Case Log"
            logs={logs}
            actionLabel="Change"
            onAction={() => console.log('Change clicked')}
          />
        </aside>
        <SummaryBox
          title="Case Summary"
          value={summary}
          onChange={setSummary}
          actionLabel="Edit"
          onAction={() => console.log('Edit Summary')}
        />
      </div>

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
    </CaseLayout>
  )
}
