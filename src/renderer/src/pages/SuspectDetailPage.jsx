// src/renderer/src/pages/SuspectDetailPage.jsx
import { useParams } from 'react-router-dom'
import CaseLayout from './CaseLayout'
import MiniButton, { MiniButtonContent } from '../components/common/MiniButton'
import bgButton from '../assets/image/bg-button.svg'
import bgButtonTransparent from '../assets/image/bg-button-transparent.svg'
import { useRef, useState, useEffect, useMemo } from 'react'
import { FaEdit, FaRegSave } from 'react-icons/fa'
import iconAddEvidance from '../assets/icons/icon-add-evidance.svg'
import NotesBox from '../components/box/NotesBox'
import { LiaEditSolid } from 'react-icons/lia'
import editBg from '../assets/image/edit.svg'
import EditPersonModal from '../components/modals/suspect/EditPersonModal'
import AddEvidenceModal from '../components/modals/evidence/AddEvidenceModal'
import { useCases } from '../store/cases' // hanya untuk caseOptions default di modal
import { useSuspects } from '../store/suspects' // ✅ suspects store
import toast from 'react-hot-toast'

const BACKEND_BASE =
  import.meta.env?.VITE_BACKEND_URL || window?.api?.backendBase || 'http://172.15.2.105:8000'

// Helper kecil untuk ambil notes dari berbagai bentuk response
function extractNotesFromDetail(res) {
  // beberapa kemungkinan bentuk:
  // { status, message, data: { data: { suspect_notes } } }
  // { status, message, data: { suspect_notes } }
  // { suspect_notes }
  // { suspectNotes }
  const inner = res?.data?.data ?? res?.data ?? res

  return (
    inner?.suspect_notes ?? inner?.suspectNotes ?? res?.suspect_notes ?? res?.suspectNotes ?? ''
  )
}

export default function SuspectDetailPage() {
  const { suspectId } = useParams()
  const suspectNumId = Number(suspectId)

  // cases store cuma buat default dropdown/modal
  const cases = useCases((s) => s.cases)

  const { fetchSuspectDetail, saveNotesRemote, editNotesRemote, loading, error } = useSuspects()

  const [detail, setDetail] = useState(null)
  const [notes, setNotes] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [openModalEdit, setOpenModalEdit] = useState(false)
  const [openAddEv, setOpenAddEv] = useState(false)
  const savingRef = useRef(false)

  // fetch suspect detail
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetchSuspectDetail(suspectNumId)
        if (!mounted) return
        setDetail(res)

        const apiNotes = extractNotesFromDetail(res)
        setNotes(apiNotes || '')
      } catch (e) {
        console.error('[SuspectDetailPage] fetch detail failed:', e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [suspectNumId, fetchSuspectDetail])

  // ===== mapping detail → UI shape (tanpa ubah UI) =====
  const mapped = useMemo(() => {
    const d = detail?.data || detail || null
    if (!d) return null
    console.log('Detail ', d)

    const person = {
      id: d.id,
      name: d.person_name || d.name || 'Unknown',
      status: d.suspect_status || d.status,
      notes: d.suspect_notes || d.suspectNotes || '',
      evidences: []
    }

    // response evidence: array wrapper
    const evWrap = d.evidences || []
    person.evidences = evWrap.map((ev) => ({
      id: ev.id,
      fileName: ev.fileName,

      // File path → ambil hanya file name terakhir
      filePath: ev.filePath ? ev.filePath.split('/').pop() : ev.evidenceNumber || 'Evidence',

      summary: ev.summary || '-',

      // Preview (jika backend support)
      previewDataUrl: ev.preview_url || ev.preview_image || null,

      // Gambar full path
      img: ev.filePath ? BACKEND_BASE + '/' + ev.filePath : null,

      // Source (jika backend menyimpan)
      source: ev.evidenceSource, // backend pakai evidenceNumber

      createdAt: ev.createdAt,
      updatedAt: ev.updatedAt
    }))
    console.log('evidences', person.evidences)

    const caseData = {
      id: d.caseId,
      name: d.caseName || d.case_name || '-',
      investigator: d.investigator || '-',
      createdAt: d.created_at_case || d.created_at || d.createdAtCase || new Date().toISOString(),
      date: d.created_at_case || d.created_at || null
    }

    return { person, caseData }
  }, [detail])

  const person = mapped?.person
  const caseData = mapped?.caseData
  const evidences = person?.evidences ?? []

  const actionLabel = isEditing ? 'Save' : notes.trim() ? 'Edit' : 'Add'
  const actionIcon = isEditing ? (
    <FaRegSave className="text-[16px]" />
  ) : (
    <LiaEditSolid className="text-[18px]" />
  )

  const onNotesAction = async () => {
    if (!person) return
    if (!isEditing) {
      setIsEditing(true)
      return
    }
    if (savingRef.current) return
    savingRef.current = true
    try {
      const payload = {
        suspect_id: person.id,
        notes
      }

      const hasNotesBefore = !!(detail?.suspectNotes || detail?.suspect_notes)
      if (!hasNotesBefore) {
        await saveNotesRemote(payload)
      } else {
        await editNotesRemote(payload)
      }

      setIsEditing(false)

      // 🔄 Refetch dan sync detail + notes
      const res = await fetchSuspectDetail(suspectNumId)
      setDetail(res)
      const apiNotes = extractNotesFromDetail(res)
      setNotes(apiNotes || '')
    } catch (e) {
      console.error('Failed to save notes:', e)
    } finally {
      savingRef.current = false
    }
  }

  async function downloadSuspectPdf(suspectId) {
    const res = await window.api.invoke('suspects:exportPdf', suspectId)

    if (res.error) {
      alert(res.message)
      return
    }

    toast.success('PDF exported successfully. Please check your Downloads folder.')
  }

  if (!mapped) {
    return (
      <CaseLayout title="Suspect Management" showBack={true}>
        <div className="text-center text-[#C7D2E1] mt-10">
          {loading ? (
            'Loading suspect detail…'
          ) : (
            <>
              Suspect not found for ID: <b>{suspectId}</b>
            </>
          )}
        </div>

        {error && <div className="text-center text-red-400 text-sm mt-3">{String(error)}</div>}
      </CaseLayout>
    )
  }

  const badgeStatus = (status = 'Unknown') => {
    if (!status || status === 'Unknown') {
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

  const fmt = (val) => {
    if (!val) return '-'
    if (typeof val === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
      return val // sudah format DD/MM/YYYY dari backend
    }
    const d = new Date(val)
    if (Number.isNaN(d.getTime())) return String(val)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = String(d.getFullYear())
    return `${dd}/${mm}/${yyyy}`
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
                {fmt(caseData?.createdAtCase ?? caseData?.createdAt)}
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
          <MiniButton onClick={() => downloadSuspectPdf(person.id)}>
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

          {/* ADD EVIDENCE BUTTON */}
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

        <div className="grid gap-4 pr-2 overflow-y-auto custom-scroll" style={{ maxHeight: 240 }}>
          {evidences.map((e) => (
            <div key={e.id} className="flex gap-4 items-start">
              {e.previewDataUrl || e.img ? (
                <img
                  src={e.previewDataUrl || e.img || 'https://placehold.co/180x110?text=No+Image'}
                  alt="evidence"
                  className="w-[180px] h-[110px] object-cover rounded-sm border"
                  style={{ borderColor: '#3E4B5D' }}
                />
              ) : (
                <div className="w-[180px] h-[110px] border border-[#3E4B5D] text-xs opacity-60 flex items-center justify-center">
                  No Preview
                </div>
              )}
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

      {/* NOTES */}
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
          maxBodyHeight={240}
          autoGrow={false}
        />
      </div>

      {/* MODALS */}
      {openModalEdit && (
        <EditPersonModal
          open={openModalEdit}
          onClose={() => setOpenModalEdit(false)}
          caseId={caseData.id}
          person={person}
          suspectId={person.id}
          onSaved={async () => {
            // 🔄 Refetch + sync detail & notes setelah edit modal
            const res = await fetchSuspectDetail(suspectNumId)
            setDetail(res)
            const apiNotes = extractNotesFromDetail(res)
            setNotes(apiNotes || '')
          }}
        />
      )}

      {openAddEv && (
        <AddEvidenceModal
          open={openAddEv}
          onClose={() => setOpenAddEv(false)}
          onSave={async (data) => {
            try {
              await window.api.invoke('evidence:create', {
                ...data,
                suspect_id: person.id,
                case_id: caseData.id
              })
              const res = await fetchSuspectDetail(suspectNumId)
              setDetail(res)
              const apiNotes = extractNotesFromDetail(res)
              setNotes(apiNotes || '')
            } catch (e) {
              console.error('[AddEvidenceModal] failed:', e)
            } finally {
              setOpenAddEv(false)
            }
          }}
          defaultCaseId={caseData.id}
          defaultCaseName={caseData.name}
          defaultInvestigator={caseData.investigator}
          defaultPerson={person}
          caseOptions={(cases ?? []).map((c) => ({ value: c.id, label: c.name }))}
        />
      )}
    </CaseLayout>
  )
}
