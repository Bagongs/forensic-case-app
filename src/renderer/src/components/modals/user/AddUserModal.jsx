/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import Modal from '../Modal'
import FormLabel from '../../atoms/FormLabel'
import Input from '../../atoms/Input'

export default function AddUserModal({ open, onClose, onSave }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [tag, setTag] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Reset form setiap kali modal ditutup
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

  const handleSave = () => {
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill all required fields')
      return
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    onSave({ name, email, password, tag })
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Add User"
      onCancel={onClose}
      confirmText="Add User"
      onConfirm={handleSave}
    >
      <div className="grid gap-3">
        {/* Name */}
        <FormLabel>Name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />

        {/* Email */}
        <FormLabel>Email</FormLabel>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
        />

        {/* Password */}
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

        {/* Confirm Password */}
        <FormLabel>Confirm Password</FormLabel>
        <div className="relative">
          <Input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

        {/* Tag */}
        <FormLabel>Tag</FormLabel>
        <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Input tag" />
      </div>
    </Modal>
  )
}
