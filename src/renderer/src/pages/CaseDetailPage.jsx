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
import iconEdit from '../assets/icons/icon-edit.svg'
import iconPersonAdd from '../assets/icons/icon-person-add.svg'
import SummaryBox from '../components/SummaryBox'
import CaseLogBox from '../components/CaseLogBox'
import { PersonSectionBox } from '../components/PersonSectionBox'
import { PersonBox } from '../components/PersonBox'
import { EvidenceCard } from '../components/EvidanceCard'

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

  const persons = [
    {
      name: 'Mandeep Singh',
      role: 'Suspect',
      roleColor: '#B44D3E',
      evidences: [
        {
          code: '342344442',
          image: '/images/cctv1.jpg',
          summary:
            'Berdasarkan rekaman CCTV tanggal 10 September 2025 pukul 14.32 WIB, individu yang diduga sebagai target tampak memasuki area check-in internasional.'
        },
        {
          code: '342344443',
          image: '/images/passport.jpg',
          summary: 'Tersangka terlihat menggunakan dokumen palsu untuk melintas perbatasan.'
        }
      ]
    },
    {
      name: 'Nathalie',
      role: 'Witness',
      roleColor: '#2B7ABD',
      evidences: [
        {
          code: '342344444',
          image: '/images/nathalie.jpg',
          summary:
            'Berdasarkan rekaman CCTV tanggal 10 September 2025 pukul 14.32 WIB, individu terlihat oleh Nathalie.'
        }
      ]
    }
  ]

  // selectors dari store
  const getCaseById = useCases((s) => s.getCaseById)
  const addNote = useCases((s) => s.addNote)
  const updateCase = useCases((s) => s.updateCase)
  const [editPersonOpen, setEditPersonOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)

  const item = getCaseById?.(id)
  const [summary, setSummary] = useState(item?.summary || '')

  // modal states
  const [addPersonOpen, setAddPersonOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [noteText, setNoteText] = useState('')

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

  return (
    <CaseLayout title="Case Management" showBack={true}>
      {/* <div className="flex py-8 items-center gap-3 mb-2">
        <button
          className="px-3 py-1.5 rounded-lg border"
          style={{ borderColor: 'var(--border)' }}
          onClick={() => nav(-1)}
        >
          Back
        </button>
        <div className="text-lg opacity-70">Case Management</div>
      </div> */}

      {/* header */}
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
              icon={iconEdit}
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
        {/* LEFT */}
        <div className="space-y-6">
          {/* description */}
          <section
            className="rounded-xl border p-4"
            style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
          >
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--dim)' }}>
              Case description
            </div>
            <p className="text-sm leading-relaxed">{item.description || 'No description.'}</p>
          </section>

          {/* persons */}
          {/* <section
            className="rounded-xl border p-4"
            style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold" style={{ color: 'var(--dim)' }}>
                Person of interest ({item.persons.length})
              </div>
              <MiniButton onClick={() => setAddPersonOpen(true)}>
                <MiniButtonContent
                  bg={bgButtonTransparent}
                  text="Add Person"
                  icon={iconPersonAdd}
                  textColor="text-white"
                />
              </MiniButton>
            </div>

            <div className="space-y-6">
              {item.persons.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 border-b"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-baseline gap-2 min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <span
                        className="px-2 py-0.5 rounded-md border text-sm opacity-80"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        {p.status || 'Suspect'}
                      </span>
                    </div>

                    <button
                      className="px-3 py-1.5 rounded-lg border"
                      style={{ borderColor: 'var(--border)' }}
                      onClick={() => {
                        setSelectedPerson(p)
                        setEditPersonOpen(true)
                      }}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    {p.evidences.length === 0 && (
                      <div className="opacity-70 text-sm">No evidence yet.</div>
                    )}

                    {p.evidences.map((ev) => (
                      <div
                        key={ev.id}
                        className="grid grid-cols-[96px_1fr_auto] gap-3 rounded-lg border p-3"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div
                          className="h-20 w-24 rounded bg-white/5 grid place-items-center border overflow-hidden"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          {ev.previewDataUrl ? (
                            <img
                              src={ev.previewDataUrl}
                              alt={ev.fileName || 'evidence'}
                              className="max-h-20 max-w-24 object-contain rounded"
                            />
                          ) : (
                            <span className="opacity-60 text-xs">No preview</span>
                          )}
                        </div>

                        <div className="text-sm min-w-0">
                          <div className="text-xs opacity-70">Evidence Summary</div>
                          <div className="truncate">{ev.summary || ev.fileName || '—'}</div>
                        </div>

                        <div className="opacity-70 text-sm self-center">Analysis</div>
                      </div>
                    ))}

                    <div className="pt-2">
                      <button
                        className="px-3 py-1.5 rounded-lg border text-sm"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        Add Evidence
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section> */}
          <PersonSectionBox
            title="Person of Interest"
            total={persons.length}
            borderColor='#FFFFFF'
            actionBgImage={bgButtonTransparent}
            onAddPerson={() => setAddPersonOpen(true)}
          >
            {persons.map((person, i) => (
              <PersonBox
                key={i}
                name={person.name}
                roleLabel={person.role}
                roleColor={person.roleColor}
                actionBgImage={bgButton}
                onEdit={() => console.log('edit', person.name)}
                onAddEvidence={() => console.log('add evidence for', person.name)}
              >
                {person.evidences.map((ev, j) => (
                  <EvidenceCard
                    key={j}
                    image={ev.image}
                    code={ev.code}
                    summary={ev.summary}
                  />
                ))}
              </PersonBox>
            ))}
          </PersonSectionBox>

          {/* notes */}
          {/* <section
            className="rounded-xl border p-4"
            style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
          >
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--dim)' }}>
              Notes
            </div>

            <div className="space-y-2 mb-3">
              {item.notes.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg border px-3 py-2"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="text-xs opacity-70 mb-1">
                    {new Date(n.at).toLocaleDateString()}{' '}
                    {new Date(n.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {n.author ? `  ${n.author}` : ''}
                  </div>
                  <div className="text-sm">{n.text}</div>
                </div>
              ))}
              {!item.notes.length && <div className="opacity-70 text-sm">No notes.</div>}
            </div>

            <input
              className="w-full px-3 py-2 rounded-lg border bg-transparent mb-2"
              style={{ borderColor: 'var(--border)' }}
              placeholder="Write notes"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <div className="text-right">
              <button
                className="px-3 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => {
                  const txt = noteText.trim()
                  if (!txt) return
                  addNote(item.id, txt, item.investigator || '')
                  setNoteText('')
                }}
              >
                Save notes
              </button>
            </div>
          </section> */}
        </div>

        {/* RIGHT – case log */}
        {/* <aside
          className="rounded-xl border p-4 h-max"
          style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold" style={{ color: 'var(--dim)' }}>
              Case Log
            </div>
            <button
              className="px-3 py-1.5 rounded-lg border text-sm"
              style={{ borderColor: 'var(--border)' }}
              onClick={() => setStatusOpen(true)}
            >
              Change
            </button>
          </div>

          <div className="space-y-4">
            {item.logs.map((l) => (
              <div key={l.id} className="text-sm">
                <div className="font-medium">{l.type}</div>
                <div className="text-xs opacity-70">{new Date(l.at).toLocaleString()}</div>
                {l.by && <div className="text-xs opacity-70">By: {l.by}</div>}
                {l.note && <div className="text-xs mt-1">{l.note}</div>}
                <div className="border-t my-3" style={{ borderColor: 'var(--border)' }} />
              </div>
            ))}
            {!item.logs.length && <div className="opacity-70 text-sm">No log.</div>}
          </div>
        </aside> */}
        <aside>
          <CaseLogBox
            title="Case Log"
            logs={logs}
            actionLabel="Change"
            onAction={() => console.log('Change clicked')}
          />
        </aside>
        {/* <SummaryBox></SummaryBox> */}
        <SummaryBox
          title="Case Summary"
          value={summary}
          onChange={setSummary}
          actionLabel="Edit"
          // actionBgImage={bgButton}
          onAction={() => console.log('Edit Summary')}
        />
      </div>

      {/* Modals */}
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
