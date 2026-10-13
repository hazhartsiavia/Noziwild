// Page /forgot-password : demande un lien de réinitialisation par email
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { LABEL, FIELD, PRIMARY } from '../components/authStyles'
import { requestPasswordReset } from '../api'

function ForgotPassword() {
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const { email } = Object.fromEntries(new FormData(event.currentTarget))

    setStatus('sending')
    try {
      const body = await requestPasswordReset(email)
      setMessage(body.message)
      setStatus('sent')
    } catch (err) {
      setMessage(err.message)
      setStatus('error')
    }
  }

  return (
    <AuthLayout
      title="Forgot Your Password?"
      text="Enter the email address of your account. We will send you a link to choose a new password."
    >
      {status === 'sent' ? (
        <div className="mt-8 rounded-3xl bg-[#D5E8E2]/60 p-6">
          <p role="status" className="text-base md:text-lg text-slate-800">{message}</p>
          <p className="mt-3 text-sm md:text-base text-slate-600">
            The link expires in one hour. Remember to check your spam folder.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <label htmlFor="forgot-email" className={LABEL}>Email Address</label>
            <input id="forgot-email" name="email" type="email" required autoComplete="email" className={FIELD} />
          </div>

          <button type="submit" disabled={status === 'sending'} className={`mt-2 ${PRIMARY}`}>
            {status === 'sending' ? 'Please wait…' : 'Send the link'}
          </button>

          {status === 'error' && <p role="alert" className="text-sm md:text-base text-red-700">{message}</p>}
        </form>
      )}

      <p className="mt-8 text-sm md:text-base text-slate-600">
        Remembered it?{' '}
        <Link to="/login" className="font-medium text-[#a9813a] hover:underline">Back to log in</Link>
      </p>
    </AuthLayout>
  )
}

export default ForgotPassword
