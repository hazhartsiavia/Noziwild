// Pages /login et /register : même composant, deux modes
import React, { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import GoogleButton from '../components/GoogleButton'
import PasswordInput from '../components/PasswordInput'
import { LABEL, FIELD, PRIMARY, FIELD_ERROR } from '../components/authStyles'
import { useAuth } from '../context/AuthContext'
import { useT } from '../i18n/LanguageContext'

// N'accepte que des chemins internes au site (évite les redirections vers un autre site)
function safeNext(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/account'
}

// Textes : auth.login et auth.register (locales/<langue>/auth.json)
const COPY = {
  login: { googleText: 'signin_with', switchTo: '/register' },
  register: { googleText: 'signup_with', switchTo: '/login' },
}

function Auth({ mode = 'login' }) {
  const t = useT('auth')
  const copy = { ...COPY[mode], ...t(mode) }
  const isRegister = mode === 'register'
  const { user, loading, login, register, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))

  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'error'
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Déjà connecté : inutile de rester sur cette page
  if (!loading && user) return <Navigate to={next} replace />

  const fail = (err) => {
    setError(err.message)
    setFieldErrors(err.fields || {})
    setStatus('error')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const { name, email, password } = Object.fromEntries(new FormData(event.currentTarget))

    setStatus('sending')
    setFieldErrors({})
    try {
      if (isRegister) await register(name, email, password)
      else await login(email, password)
      navigate(next, { replace: true })
    } catch (err) {
      fail(err)
    }
  }

  const handleGoogle = async (credential) => {
    setStatus('sending')
    try {
      await googleLogin(credential)
      navigate(next, { replace: true })
    } catch (err) {
      fail(err)
    }
  }

  const switchHref = params.get('next') ? `${copy.switchTo}?next=${encodeURIComponent(next)}` : copy.switchTo

  return (
    <AuthLayout title={copy.title} text={copy.text}>
      <div className="mt-8">
        <GoogleButton onCredential={handleGoogle} text={copy.googleText} />
      </div>

      <div className="my-8 flex items-center gap-4 text-sm text-slate-500" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200" />
        {t('orEmail')}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {isRegister && (
          <div>
            <label htmlFor="auth-name" className={LABEL}>{t('name')}</label>
            <input id="auth-name" name="name" type="text" required autoComplete="name" className={FIELD} />
            {fieldErrors.name && <p className={FIELD_ERROR}>{fieldErrors.name}</p>}
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className={LABEL}>{t('email')}</label>
          <input id="auth-email" name="email" type="email" required autoComplete="email" className={FIELD} />
          {fieldErrors.email && <p className={FIELD_ERROR}>{fieldErrors.email}</p>}
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="auth-password" className={LABEL}>{t('password')}</label>
            {!isRegister && (
              <Link to="/forgot-password" className="mb-2 text-sm text-[#a9813a] hover:underline">
                {t('forgot')}
              </Link>
            )}
          </div>
          <PasswordInput
            id="auth-password"
            name="password"
            required
            minLength={isRegister ? 8 : undefined}
            maxLength={72}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
          {isRegister && !fieldErrors.password && (
            <p className="mt-1 pl-6 text-xs sm:text-sm text-slate-500">{t('minLength')}</p>
          )}
          {fieldErrors.password && <p className={FIELD_ERROR}>{fieldErrors.password}</p>}
        </div>

        <button type="submit" disabled={status === 'sending'} className={`mt-2 ${PRIMARY}`}>
          {status === 'sending' ? t('wait') : copy.submit}
        </button>

        {status === 'error' && (
          <p role="alert" className="text-sm md:text-base text-red-700">{error}</p>
        )}
      </form>

      <p className="mt-8 text-sm md:text-base text-slate-600">
        {copy.switchText}{' '}
        <Link to={switchHref} className="font-medium text-[#a9813a] hover:underline">
          {copy.switchLink}
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Auth
