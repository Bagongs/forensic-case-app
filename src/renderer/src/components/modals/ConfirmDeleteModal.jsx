/* eslint-disable react/prop-types */
import { MdOutlineWarningAmber } from 'react-icons/md'
import Modal from './Modal'

export default function ConfirmDeleteModal({ open, onClose, onConfirm, name, colorIcon = 'red' }) {
  return (
    <Modal
      open={open}
      title="Confirm Delete"
      onCancel={onClose}
      confirmText="Delete"
      onConfirm={onConfirm}
    >
      <div className="flex gap-4 flex-col items-center">
        <MdOutlineWarningAmber color={colorIcon} size={64} />
        <p className="text-lg">
          Are you sure you want to delete this record for{' '}
          <span className="font-semibold">{name}</span>?
        </p>
      </div>
    </Modal>
  )
}
