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

  // === VALIDASI ===
  const passwordTooShort = password && password.length < 8
  const confirmTooShort = confirmPassword && confirmPassword.length < 8
  const mismatch =
    password &&
    confirmPassword &&
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    password !== confirmPassword

  const isInvalid = !name || !email || passwordTooShort || confirmTooShort || mismatch || !tag

  const handleSave = async () => {
    if (isInvalid) return

    const patch = {
      fullname: name,
      email,
      tag
    }

    if (password) {
      patch.password = password
      patch.confirm_password = confirmPassword
    }

    await onSave(user.id, patch)
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Edit User"
      onCancel={onClose}
      confirmText="Save Changes"
      onConfirm={handleSave}
      disableConfirm={isInvalid}
    >
      <div className="grid gap-3">
        {/* Name */}
        <FormLabel>Name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />

        {/* Email */}
        <FormLabel>Email</FormLabel>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />

        {/* Password */}
        <FormLabel>Password</FormLabel>
        <div className="relative">
          <Input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (optional)"
            data-optional="true"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA3B2]"
          >
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Error password */}
        {passwordTooShort && (
          <p className="text-red-400 text-xs">Password must be at least 8 characters</p>
        )}

        {/* Confirm Password */}
        <FormLabel>Confirm Password</FormLabel>
        <div className="relative">
          <Input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter Password"
            data-optional="true"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA3B2]"
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Error confirm password */}
        {confirmTooShort && (
          <p className="text-red-400 text-xs">Confirm Password must be at least 8 characters</p>
        )}

        {/* Error mismatch */}
        {mismatch && <p className="text-red-400 text-xs">Passwords do not match</p>}

        {/* Tag */}
        <FormLabel>Tag</FormLabel>
        <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Input tag" />
      </div>
    </Modal>
  )
}
