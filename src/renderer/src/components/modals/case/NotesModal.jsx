import Modal from '../Modal'

// eslint-disable-next-line react/prop-types
export default function NotesModal({ open, onClose, notes }) {
  return (
    <Modal open={open} title="Notes" onCancel={onClose}>
      <div className="flex gap-5 flex-col items-start">{notes}</div>
    </Modal>
  )
}
