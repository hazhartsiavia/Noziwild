// Page /reset-password?token=... : ouverte depuis le lien reçu par email
import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/PasswordInput'
import { LABEL, PRIMARY, FIELD_ERROR } from '../components/authStyles'
import { useAuth } from '../context/AuthContext'
import { resetPassword } from '../api'

function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const { updateUser } = useAuth()
  const navigate = useNavigate()

  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'error'
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async (event) => {
    event.preventDefault()
    const { password, confirm } = Object.fromEntries(new FormData(event.currentTarget))

    if (password !== confirm) {
      setFieldErrors({ confirm: 'The two passwords do not match.' })
      return
    }

    setStatus('sending')
    setFieldErrors({})
    try {
      // Le serveur connecte directement l'utilisateur avec son nouveau mot de passe
      const { user } = await resetPassword(token, password)
      updateUser(user)
      navigate('/account', { replace: true, state: { notice: 'Your new password is saved. You are now logged in.' } })
    } catch (err) {
      setError(err.message)
      setFieldErrors(err.fields || {})
      setStatus('error')
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Link Incomplete" text="This page must be opened from the link we sent you by email.">
        <Link to="/forgot-password" className={`mt-8 inline-block ${PRIMARY}`}>Ask for a new link</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Choose a New Password" text="Your other devices will be logged out for your security.">
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label htmlFor="reset-password" className={LABEL}>New password</label>
          <PasswordInput id="reset-password" name="password" required minLength={8} maxLength={72} autoComplete="new-password" />
          {fieldErrors.password
            ? <p className={FIELD_ERROR}>{fieldErrors.password}</p>
            : <p className="mt-1 pl-6 text-xs sm:text-sm text-slate-500">At least 8 characters.</p>}
        </div>

        <div>
          <label htmlFor="reset-confirm" className={LABEL}>Confirm the new password</label>
          <PasswordInput id="reset-confirm" name="confirm" required minLength={8} maxLength={72} autoComplete="new-password" />
          {fieldErrors.confirm && <p className={FIELD_ERROR}>{fieldErrors.confirm}</p>}
        </div>

        <button type="submit" disabled={status === 'sending'} className={`mt-2 ${PRIMARY}`}>
          {status === 'sending' ? 'Please wait…' : 'Save my new password'}
        </button>

        {status === 'error' && (
          <p role="alert" className="text-sm md:text-base text-red-700">
            {error}{' '}
            {!fieldErrors.password && (
              <Link to="/forgot-password" className="font-medium text-[#a9813a] hover:underline">Ask for a new link</Link>
            )}
          </p>
        )}
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
