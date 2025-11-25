import Modal from '../Modal'

// eslint-disable-next-line react/prop-types
export default function NotesModal({ open, onClose, notes }) {
  return (
    <Modal open={open} title="Notes" onCancel={onClose}>
      <div className="flex flex-col gap-5 items-start break-all whitespace-pre-wrap">
        {notes}
      </div>
    </Modal>
  )
}
