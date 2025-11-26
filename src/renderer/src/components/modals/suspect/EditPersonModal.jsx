/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import Modal from '../Modal'
import { useCases } from '../../../store/cases'
import { FaTrashAlt } from 'react-icons/fa'
import FormLabel from '../../atoms/FormLabel'
import Radio from '../../atoms/Radio'

const STATUS_OPTIONS = ['Witness', 'Reported', 'Suspected', 'Suspect', 'Defendant']

export default function EditPersonModal({
  open,
  onClose,
  caseId,
  person,
  showDelete = false,
  onRequestDelete = () => {},
  onSaved = () => {}
}) {
  const fetchCaseDetail = useCases((s) => s.fetchCaseDetail)
  // person core
  const [name, setName] = useState('')
  const [status, setStatus] = useState(null)
  const [poiMode, setPoiMode] = useState('known') // 'known' | 'unknown'

  // notes (suspect_notes di backend)
  const [notes, setNotes] = useState('')
  const [hadExistingNotes, setHadExistingNotes] = useState(false)
  const [loadingNotes, setLoadingNotes] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const cleanupRef = useRef(false)

  // ambil suspect_id dari person (asumsi: person.id = suspect_id)
  const suspectId = person?.suspect_id ?? person?.id

  // reset semua ketika modal dibuka / person berubah
  useEffect(() => {
    if (!open || !person) return

    setError(null)

    setName(person.name || '')
    setStatus(person.status || null)

    const mode = person.name === 'Unknown' && person.status == null ? 'unknown' : 'known'
    setPoiMode(mode)

    setNotes('')
    setHadExistingNotes(false)

    const loadNotes = async () => {
      if (!suspectId) return
      setLoadingNotes(true)
      try {
        const res = await window.api.invoke('suspects:detail', Number(suspectId))

        const suspectNotes =
          res?.data?.data?.suspect_notes ?? res?.data?.suspect_notes ?? res?.suspect_notes ?? null

        if (typeof suspectNotes === 'string' && suspectNotes.trim()) {
          setNotes(suspectNotes)
          setHadExistingNotes(true)
        } else {
          setNotes('')
          setHadExistingNotes(false)
        }
      } catch (err) {
        console.error('Failed to load suspect detail', err)
      } finally {
        setLoadingNotes(false)
      }
    }

    loadNotes()
  }, [open, person, suspectId])

  const isUnknown = poiMode === 'unknown'
  const hasName = name.trim().length > 0
  const hasStatus = !!status

  // ✅ kontrak: kalau known, wajib name + status
  const canSubmit = !!suspectId && (isUnknown || (hasName && hasStatus)) && !submitting

  const handleClose = () => {
    if (cleanupRef.current) cleanupRef.current = false
    onClose?.()
  }

  const handleSave = async () => {
    if (!canSubmit || submitting) return
    if (!suspectId) {
      setError('Suspect ID not found')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      let finalName = name.trim()
      let finalStatus = status

      if (isUnknown) {
        finalName = 'Unknown'
        finalStatus = null
      }

      // 1) UPDATE SUSPECT
      const updatePayload = {
        is_unknown_person: isUnknown,
        person_name: isUnknown ? null : finalName,
        suspect_status: isUnknown ? null : finalStatus || null
      }

      const updRes = await window.api.invoke('suspects:update', {
        id: Number(suspectId),
        payload: updatePayload
      })
      if (updRes?.error) throw new Error(updRes.message || 'Failed to update suspect')

      // 2) UPDATE / SAVE NOTES
      const trimmedNotes = (notes || '').trim()
      // if (trimmedNotes) {
      const notesBody = {
        suspect_id: Number(suspectId),
        notes: trimmedNotes
      }

      const noteRes = hadExistingNotes
        ? await window.api.invoke('suspects:editNotes', notesBody)
        : await window.api.invoke('suspects:saveNotes', notesBody)

      if (noteRes?.error) {
        // notes error tidak menggagalkan update suspect, tapi tetap tampilkan warning
        console.warn('[EditPersonModal] notes update failed:', noteRes.message)
      }
      // }

      if (caseId) {
        try {
          console.log('rehit fetch')
          const res = await fetchCaseDetail(caseId)
          console.log('Rehit Resp : ', res)
        } catch (err) {
          console.error('Failed to refresh case detail', err)
        }
      }
      onSaved?.()
      handleClose()
    } catch (err) {
      console.error('Failed to update suspect', err)
      setError(err?.message || 'Failed to update suspect')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Edit Person of Interest"
      onCancel={handleClose}
      confirmText={submitting ? 'Saving…' : 'Save'}
      disableConfirm={!canSubmit || submitting}
      onConfirm={handleSave}
      size="lg"
    >
      <div className="grid gap-3">
        <div className="flex justify-between gap-2 items-center">
          <FormLabel>Person of Interest</FormLabel>
          {showDelete && (
            <button
              type="button"
              onClick={onRequestDelete}
              className="bg-[#59120C] border border-[#9D120F] p-2 flex items-center justify-center rounded-sm"
            >
              <FaTrashAlt />
            </button>
          )}
        </div>

        {/* Mode POI */}
        <div className="flex items-center gap-6">
          <Radio
            checked={poiMode === 'known'}
            onChange={() => setPoiMode('known')}
            disabled={submitting}
          >
            Person name
          </Radio>
          <Radio
            checked={poiMode === 'unknown'}
            onChange={() => setPoiMode('unknown')}
            disabled={submitting}
          >
            Unknown Person
          </Radio>
        </div>

        {/* Detail Person */}
        {poiMode === 'known' && (
          <>
            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
                Person Name
              </div>
              <input
                className="w-full px-3 py-2 rounded-lg border bg-transparent"
                style={{ borderColor: 'var(--border)' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                disabled={submitting}
              />
            </div>

            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
                Status
              </div>
              <select
                className="w-full px-3 py-2 rounded-lg border bg-[#151d28]"
                style={{ borderColor: 'var(--border)' }}
                value={status || ''}
                onChange={(e) => setStatus(e.target.value)}
                disabled={submitting}
              >
                <option value="" disabled>
                  Select Status
                </option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Notes */}
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dim)' }}>
            Notes (Optional)
          </div>
          <textarea
            rows={4}
            className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
            style={{ borderColor: 'var(--border)' }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={loadingNotes ? 'Loading notes…' : 'Write suspect notes (optional)'}
            disabled={submitting || loadingNotes}
            data-optional="true"
          />
        </div>

        {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
      </div>
    </Modal>
  )
}
