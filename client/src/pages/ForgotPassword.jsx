// Page /forgot-password : demande un lien de réinitialisation par email
import React, { useState } from 'react'
import { Link } from '../i18n/router'
import AuthLayout from '../components/AuthLayout'
import { LABEL, FIELD, PRIMARY } from '../components/authStyles'
import { requestPasswordReset } from '../api'
import { useT } from '../i18n/LanguageContext'

function ForgotPassword() {
  const t = useT('auth')
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const { email } = Object.fromEntries(new FormData(event.currentTarget))

    setStatus('sending')
    try {
      await requestPasswordReset(email)
      // Même message que le serveur, dans la langue du site
      setMessage(t('forgotSent'))
      setStatus('sent')
    } catch (err) {
      setMessage(err.message)
      setStatus('error')
    }
  }

  return (
    <AuthLayout
      title={t('forgotTitle')}
      text={t('forgotText')}
    >
      {status === 'sent' ? (
        <div className="mt-8 rounded-3xl bg-[#D5E8E2]/60 p-6">
          <p role="status" className="text-base md:text-lg text-slate-800">{message}</p>
          <p className="mt-3 text-sm md:text-base text-slate-600">
            {t('forgotExpires')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <label htmlFor="forgot-email" className={LABEL}>{t('email')}</label>
            <input id="forgot-email" name="email" type="email" required autoComplete="email" className={FIELD} />
          </div>

          <button type="submit" disabled={status === 'sending'} className={`mt-2 ${PRIMARY}`}>
            {status === 'sending' ? t('wait') : t('sendLink')}
          </button>

          {status === 'error' && <p role="alert" className="text-sm md:text-base text-red-700">{message}</p>}
        </form>
      )}

      <p className="mt-8 text-sm md:text-base text-slate-600">
        {t('remembered')}{' '}
        <Link to="/login" className="font-medium text-[#a9813a] hover:underline">{t('backToLogin')}</Link>
      </p>
    </AuthLayout>
  )
}

export default ForgotPassword
