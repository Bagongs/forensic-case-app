import { useParams } from 'react-router-dom'
import CaseLayout from './CaseLayout'
import MiniButton, { MiniButtonContent } from '../components/MiniButton'
import { useCases } from '../store/cases'
import bgButton from '../assets/image/bg-button.svg'
import bgButtonTransparent from '../assets/image/bg-button-transparent.svg'
import { useRef, useState } from 'react'
import { FaEdit, FaRegSave } from 'react-icons/fa'
import iconAddEvidance from '../assets/icons/icon-add-evidance.svg'
import NotesBox from '../components/NotesBox'
import { LiaEditSolid } from 'react-icons/lia'
import editBg from '../assets/image/edit.svg'
import EditPersonModal from '../components/EditPersonModal'
import AddEvidenceModal from '../components/AddEvidenceModal'

export default function SuspectDetailPage() {
  const { suspectId } = useParams()
  const cases = useCases((s) => s.cases)
  const updatePerson = useCases((s) => s.updatePerson)
  const addEvidenceToPerson = useCases((s) => s.addEvidenceToPerson)

  // cari case & person berdasarkan suspectId
  let caseData = null
  let person = null
  for (const c of cases) {
    const found = (c.persons || []).find((p) => p.id === suspectId)
    if (found) {
      caseData = c
      person = found
      break
    }
  }

  const [notes, setNotes] = useState(person?.notes || '')
  const [isEditing, setIsEditing] = useState(false)
  const [openModalEdit, setOpenModalEdit] = useState(false)
  const [openAddEv, setOpenAddEv] = useState(false)
  const savingRef = useRef(false)
  const evidences = person?.evidences ?? []

  const actionLabel = isEditing ? 'Save' : notes.trim() ? 'Edit' : 'Add'
  const actionIcon = isEditing ? (
    <FaRegSave className="text-[16px]" />
  ) : (
    <LiaEditSolid className="text-[18px]" />
  )

  const onNotesAction = async () => {
    if (!person || !caseData) return
    if (!isEditing) {
      setIsEditing(true)
      return
    }
    if (savingRef.current) return
    savingRef.current = true
    try {
      updatePerson(caseData.id, person.id, { notes })
      setIsEditing(false)
    } catch (e) {
      console.error('Failed to save summary:', e)
    } finally {
      savingRef.current = false
    }
  }

  if (!caseData || !person) {
    return (
      <CaseLayout title="Suspect Management" showBack={true}>
        <div className="text-center text-[#C7D2E1] mt-10">
          Suspect not found for ID: <b>{suspectId}</b>
        </div>
      </CaseLayout>
    )
  }
  const badgeStatus = (status = 'Unknown') => {
    if (!status) {
      return
    }
    const s = status.toLowerCase()
    let bg = '#222',
      color = '#fff',
      border = '#fff'

    if (s === 'witness') {
      bg = '#004166'
      border = '#9FDCFF'
      color = '#9FDCFF'
    } else if (s === 'reported') {
      bg = '#332E00'
      border = '#D2BA00'
      color = '#D2BA00'
    } else if (s === 'suspected') {
      bg = '#332400'
      border = '#FF7402'
      color = '#FF7402'
    } else if (s === 'suspect') {
      bg = '#511600'
      border = '#FF6551'
      color = '#FF6551'
    } else if (s === 'defendant') {
      bg = '#330006'
      border = '#FF0221'
      color = '#FF0221'
    }

    return (
      <div
        className="py-1 text-[13px] font-semibold text-center rounded-full"
        style={{
          background: bg,
          color,
          border: `2px solid ${border}`,
          width: 'fit-content',
          minWidth: 120
        }}
      >
        {status}
      </div>
    )
  }

  return (
    <CaseLayout title="Suspect Management" showBack={true}>
      {/* HEADER */}
      <div className="flex mt-8 items-start justify-between">
        <div>
          <div className="flex flex-row gap-5">
            <div>
              <h1 className="font-[Aldrich] text-[26px] text-[#F4F6F8] mb-1">
                {person.name || 'Unknown'}
              </h1>
              <div className="text-[#DDE3ED] text-[14px]">
                {caseData?.investigator || '-'} -{' '}
                {caseData?.date ||
                  new Date(caseData?.createdAt || Date.now()).toLocaleDateString('id-ID')}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3">{badgeStatus(person.status)}</div>
          </div>

          <div className="mt-3 text-[14px] text-[#C7D2E1]">
            Case Related:{' '}
            <span className="text-[#F4F6F8] font-medium">{caseData?.name || '-'}</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <MiniButton onClick={() => setOpenModalEdit(true)}>
            <MiniButtonContent
              bg={bgButtonTransparent}
              text={'Edit'}
              icon={<FaEdit />}
              textColor="text-white"
            />
          </MiniButton>
          <MiniButton>
            <MiniButtonContent bg={bgButton} text="Export PDF" textColor="text-black" />
          </MiniButton>
        </div>
      </div>

      <div className="my-5 border-t" style={{ borderColor: '#C3CFE0' }} />

      {/* EVIDENCES */}
      <div
        className="relative p-5"
        style={{
          background: '#151D28',
          border: '1px solid #2E3B4D'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-[Aldrich] text-[18px] text-[#F4F6F8]">
            Evidence <span className="opacity-60">({evidences.length})</span>
          </h2>

          <button
            onClick={() => setOpenAddEv(true)}
            className="flex items-center justify-center gap-2 px-6 py-2 text-[13px] font-[Aldrich] text-black transition-all active:scale-[0.98]"
            style={{
              background:
                'radial-gradient(circle at center, rgba(237,199,2,1) 0%, rgba(237,199,2,0.7) 100%)',
              borderTop: '1px solid #EDC702B2',
              borderBottom: '1px solid #EDC702B2',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.25)'
            }}
          >
            <img src={iconAddEvidance} alt="" className="w-4 h-4 opacity-90" />
            Add Evidence
          </button>
        </div>

        <div className="grid gap-4 pr-2 overflow-y-auto" style={{ maxHeight: 240 }}>
          {evidences.map((e) => (
            <div key={e.id} className="flex gap-4 items-start">
              <img
                src={e.previewDataUrl || e.img || 'https://placehold.co/180x110?text=No+Image'}
                alt="evidence"
                className="w-[180px] h-[110px] object-cover rounded-sm border"
                style={{ borderColor: '#3E4B5D' }}
              />
              <div className="flex-1">
                <div className="font-[Aldrich] text-[15px] mb-1 text-[#F4F6F8]">
                  {e.fileName || 'Evidence'}
                </div>
                <div className="text-[#D0D5DF] text-[13.5px] leading-relaxed">
                  {e.summary || '-'}
                </div>
              </div>
            </div>
          ))}
          {evidences.length === 0 && (
            <div className="text-[#C7D2E1] text-sm opacity-70">No evidences found.</div>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mt-6">
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

      {/* MODALS */}
      {openModalEdit && (
        <EditPersonModal
          open={openModalEdit}
          onClose={() => setOpenModalEdit(false)}
          caseId={caseData.id}
          person={person}
        />
      )}

      {openAddEv && (
        <AddEvidenceModal
          open={openAddEv}
          onClose={() => setOpenAddEv(false)}
          onSave={(data) => {
            addEvidenceToPerson(caseData.id, person.id, data)
            setOpenAddEv(false)
          }}
          defaultCaseId={caseData.id}
          defaultCaseName={caseData.name}
          defaultInvestigator={caseData.investigator}
          defaultPerson={person}
        />
      )}
    </CaseLayout>
  )
}
