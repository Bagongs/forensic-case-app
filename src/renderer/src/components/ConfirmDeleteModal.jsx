/* eslint-disable react/prop-types */
import { FaExclamationTriangle } from 'react-icons/fa'
import Modal from './Modal'

export default function ConfirmDeleteModal({ open, onClose, onConfirm, name }) {
  return (
    <Modal
      open={open}
      title="Confirm Delete"
      onCancel={onClose}
      confirmText="Delete"
      onConfirm={onConfirm}
    >
      <div className="flex gap-5 flex-row items-center">
        <FaExclamationTriangle color="red" size={20} />
        <p className="text-lg">
          Are you sure you want to delete <span className="font-semibold">{name}</span>?
        </p>
      </div>
    </Modal>
  )
}
