/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import Modal from '../Modal'
import FormLabel from '../../atoms/FormLabel'
import Input from '../../atoms/Input'

export default function EditUserModal({ open, onClose, onSave, user }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [tag, setTag] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setTag(user.tag || '')
      setPassword('')
      setConfirmPassword('')
    }
  }, [user])

  const handleSave = () => {
    if (!name || !email) return alert('Name & Email required')
    if (password && password !== confirmPassword)
      return alert('Passwords do not match')

    const patch = { name, email, tag }
    if (password) patch.password = password

    onSave(user.id, patch)
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Edit User"
      onCancel={onClose}
      confirmText="Save Changes"
      onConfirm={handleSave}
    >
      <div className="grid gap-3">
        <FormLabel>Name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />

        <FormLabel>Email</FormLabel>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />

        <FormLabel>Password</FormLabel>
        <div className="relative">
          <Input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA3B2]"
          >
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <FormLabel>Confirm Password</FormLabel>
        <div className="relative">
          <Input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter Password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA3B2]"
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <FormLabel>Tag</FormLabel>
        <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Input tag" />
      </div>
    </Modal>
  )
}
