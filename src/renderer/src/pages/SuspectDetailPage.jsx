import { useParams } from 'react-router-dom'
import CaseLayout from './CaseLayout'
import MiniButton, { MiniButtonContent } from '../components/MiniButton'
import { useCases } from '../store/cases'
import bgButton from '../assets/image/bg-button.svg'
import bgButtonTransparent from '../assets/image/bg-button-transparent.svg'
import iconEdit from '../assets/icons/icon-edit.svg'
import { useState } from 'react'

export default function SuspectDetailPage() {
  const { caseId } = useParams()
  const cases = useCases((s) => s.cases)
  const caseData = cases.find((c) => c.id === caseId)
  const person = caseData?.persons?.[0] ?? {} // sementara ambil 1 dulu
  const [editOpen, setEditOpen] = useState(false)
  const evidences = person.evidences ?? [
    {
      id: '342342352',
      img: 'https://placehold.co/200x120?text=Evidence+1',
      summary: 'GPS handphone suspect menyatakan posisi yang berada di TKP pada saat kejadian.'
    },
    {
      id: '342342353',
      img: 'https://placehold.co/200x120?text=Evidence+2',
      summary: 'Terdapat dialog seputar pembakaran dengan suspect lain.'
    },
    {
      id: '324235232',
      img: 'https://placehold.co/200x120?text=Evidence+2',
      summary: 'Terdapat dialog seputar pembakaran dengan suspect lain.'
    }
  ]

  return (
    <CaseLayout title="Suspect Management" showBack={true}>
      <div className="flex mt-8 items-start justify-between">
        <div>
          <h1 className="font-[Aldrich] text-[26px] text-[#F4F6F8] mb-1">
            {person.name || 'Unknown'}
          </h1>
          <div className="text-[#DDE3ED] text-[14px]">
            {caseData?.investigator || '-'} - {caseData?.date || '20/12/2025'}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="px-3 py-[2px] text-[13px] rounded-full"
              style={{ background: '#531313', color: '#FBEAEA' }}
            >
              {person.status || 'Defendant'}
            </span>
          </div>

          <div className="mt-3 text-[14px] text-[#C7D2E1]">
            Case Related:{' '}
            <span className="text-[#F4F6F8] font-medium">{caseData?.name || '-'}</span>
          </div>
        </div>

        {/* action buttons */}
        <div className="flex gap-3">
          <MiniButton onClick={() => setEditOpen(true)}>
            <MiniButtonContent
              bg={bgButtonTransparent}
              text="Edit"
              icon={iconEdit}
              textColor="text-white"
            />
          </MiniButton>
          <MiniButton>
            <MiniButtonContent bg={bgButton} text="Export PDF" textColor="text-black" />
          </MiniButton>
        </div>
      </div>

      <div className="my-5 border-t" style={{ borderColor: '#C3CFE0' }} />
      <div className="flex flex-col gap-6">
        {/* ===== EVIDENCE LIST SECTION ===== */}
        <div
          className="relative p-5"
          style={{
            background: '#151D28',
            border: '1px solid #2E3B4D'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-[Aldrich] text-[18px] text-[#F4F6F8]">
              Evidence <span className="opacity-60">({evidences.length})</span>
            </h2>

            <MiniButton onClick={() => {}}>
              <MiniButtonContent bg={bgButton} text="+ Add Evidence" textColor="text-black" />
            </MiniButton>
          </div>

          {/* Scrollable evidence list */}
          <div
            className="grid gap-4 pr-2 overflow-y-auto"
            style={{
              maxHeight: 240,
              scrollbarWidth: 'thin'
            }}
          >
            {evidences.map((e) => (
              <div key={e.id} className="flex gap-4 items-start">
                <img
                  src={e.img}
                  alt="evidence"
                  className="w-[180px] h-[110px] object-cover rounded-sm border"
                  style={{ borderColor: '#3E4B5D' }}
                />
                <div className="flex-1">
                  <div className="font-[Aldrich] text-[15px] mb-1 text-[#F4F6F8]">
                    Summary {e.id}
                  </div>
                  <div className="text-[#D0D5DF] text-[13.5px] leading-relaxed">{e.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== NOTES SECTION ===== */}
        <div
          className="relative p-5"
          style={{
            background: '#1A2432',
            border: '1px solid #2E3B4D',
            borderRadius: '8px'
          }}
        >
          {/* Header + Edit button */}
          <div className="flex justify-between items-center mb-2">
            <div className="font-[Aldrich] text-[16px] text-[#F4F6F8]">Notes</div>
            <button
              className="flex items-center gap-2 border border-[#6A7A94] px-3 py-[6px] text-[13px] hover:brightness-110 transition rounded"
              style={{ background: '#263246' }}
            >
              ✏️ Edit
            </button>
          </div>

          {/* Note content */}
          <div className="text-[#D0D5DF] text-[14px] leading-relaxed">
            {person.notes ||
              'Dokumentasi detail, isolasi jaringan, serta pencatatan chain of custody sangat penting untuk memastikan integritas bukti GPS handphone dan dapat dipertanggungjawabkan di pengadilan.'}
          </div>
        </div>
      </div>
    </CaseLayout>
  )
}
