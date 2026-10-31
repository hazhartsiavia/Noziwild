// Page /reset-password?token=... : ouverte depuis le lien reçu par email
import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from '../i18n/router'
import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/PasswordInput'
import { LABEL, PRIMARY, FIELD_ERROR } from '../components/authStyles'
import { useAuth } from '../context/AuthContext'
import { resetPassword } from '../api'
import { useT } from '../i18n/LanguageContext'

function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const t = useT('auth')

  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'error'
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async (event) => {
    event.preventDefault()
    const { password, confirm } = Object.fromEntries(new FormData(event.currentTarget))

    if (password !== confirm) {
      setFieldErrors({ confirm: t('mismatch') })
      return
    }

    setStatus('sending')
    setFieldErrors({})
    try {
      // Le serveur connecte directement l'utilisateur avec son nouveau mot de passe
      const { user } = await resetPassword(token, password)
      updateUser(user)
      navigate('/account', { replace: true, state: { notice: t('resetDone') } })
    } catch (err) {
      setError(err.message)
      setFieldErrors(err.fields || {})
      setStatus('error')
    }
  }

  if (!token) {
    return (
      <AuthLayout title={t('incompleteTitle')} text={t('incompleteText')}>
        <Link to="/forgot-password" className={`mt-8 inline-block ${PRIMARY}`}>{t('newLink')}</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={t('resetTitle')} text={t('resetText')}>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label htmlFor="reset-password" className={LABEL}>{t('newPassword')}</label>
          <PasswordInput id="reset-password" name="password" required minLength={8} maxLength={72} autoComplete="new-password" />
          {fieldErrors.password
            ? <p className={FIELD_ERROR}>{fieldErrors.password}</p>
            : <p className="mt-1 pl-6 text-xs sm:text-sm text-slate-500">{t('minLength')}</p>}
        </div>

        <div>
          <label htmlFor="reset-confirm" className={LABEL}>{t('confirm')}</label>
          <PasswordInput id="reset-confirm" name="confirm" required minLength={8} maxLength={72} autoComplete="new-password" />
          {fieldErrors.confirm && <p className={FIELD_ERROR}>{fieldErrors.confirm}</p>}
        </div>

        <button type="submit" disabled={status === 'sending'} className={`mt-2 ${PRIMARY}`}>
          {status === 'sending' ? t('wait') : t('save')}
        </button>

        {status === 'error' && (
          <p role="alert" className="text-sm md:text-base text-red-700">
            {error}{' '}
            {!fieldErrors.password && (
              <Link to="/forgot-password" className="font-medium text-[#a9813a] hover:underline">{t('newLink')}</Link>
            )}
          </p>
        )}
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
