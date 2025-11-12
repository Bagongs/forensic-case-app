/* eslint-disable react/prop-types */
import Modal from './Modal'
import { IoWarningSharp } from 'react-icons/io5'

export default function ConfirmDeleteModal({ open, onClose, onConfirm, name, colorIcon = 'red' }) {
  return (
    <Modal
      open={open}
      title="Confirm Delete"
      onCancel={onClose}
      confirmText="Delete"
      onConfirm={onConfirm}
    >
      <div className="flex gap-5 flex-col items-center">
        <IoWarningSharp color={colorIcon} size={40} />
        <p className="text-lg">
          Are you sure you want to delete <span className="font-semibold">{name}</span>?
        </p>
      </div>
    </Modal>
  )
}
