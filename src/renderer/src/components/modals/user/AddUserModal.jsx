/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import Modal from '../Modal'
import FormLabel from '../../atoms/FormLabel'
import Input from '../../atoms/Input'

// Karakter yang tidak boleh diinput (anti SQL Injection)
const BLOCKED_SQL_CHARS = /['";#`<>/=]|(--)/g

// Sanitizer (menghapus karakter terlarang)
const sanitizeInput = (value) => value.replace(BLOCKED_SQL_CHARS, '')

export default function AddUserModal({ open, onClose, onSave, errMessage }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [tag, setTag] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!open) {
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setTag('')
      setShowPass(false)
      setShowConfirm(false)
    }
  }, [open])

  const tagTooLong = tag.length > 30

  const isInvalid =
    !name ||
    !email ||
    !password ||
    !confirmPassword ||
    password.length < 8 ||
    confirmPassword.length < 8 ||
    password !== confirmPassword ||
    !tag ||
    tagTooLong

  const handleSave = async () => {
    if (isInvalid) return

    await onSave({
      fullname: name,
      email,
      password,
      confirm_password: confirmPassword,
      tag
    })

    onClose()
  }

  console.log('errMessage:', errMessage)
  return (
    <Modal
      open={open}
      title="Add User"
      onCancel={onClose}
      confirmText="Add User"
      onConfirm={handleSave}
      disableConfirm={isInvalid}
    >
      <div className="grid gap-3">
        {/* Name */}
        <FormLabel>Name</FormLabel>
        <Input
          value={name}
          onChange={(e) => setName(sanitizeInput(e.target.value))}
          placeholder="Name"
        />

        {/* Email */}
        <FormLabel>Email</FormLabel>
        <Input
          value={email}
          onChange={(e) => setEmail(sanitizeInput(e.target.value))}
          placeholder="Email"
          type="email"
        />

        {/* Password */}
        <FormLabel>Password</FormLabel>
        <div className="relative">
          <Input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(sanitizeInput(e.target.value))}
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

        {password && password.length < 8 && (
          <p className="text-red-400 text-xs">Password must be at least 8 characters</p>
        )}

        {/* Confirm Password */}
        <FormLabel>Confirm Password</FormLabel>
        <div className="relative">
          <Input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(sanitizeInput(e.target.value))}
            placeholder="Re-enter password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA3B2]"
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {confirmPassword && confirmPassword.length < 8 && (
          <p className="text-red-400 text-xs">Confirm Password must be at least 8 characters</p>
        )}

        {password &&
          confirmPassword &&
          password.length >= 8 &&
          confirmPassword.length >= 8 &&
          password !== confirmPassword && (
            <p className="text-red-400 text-xs">Passwords do not match</p>
          )}

        {/* Tag */}
        <FormLabel>Tag</FormLabel>
        <Input
          value={tag}
          onChange={(e) => setTag(sanitizeInput(e.target.value))}
          placeholder="Input tag"
        />

        {tagTooLong && <p className="text-red-400 text-xs">Tag must be at most 30 characters</p>}
        {errMessage != null && <p className="text-red-400 text-xs">{errMessage}</p>}
      </div>
    </Modal>
  )
}
