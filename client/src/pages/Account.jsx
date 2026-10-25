// Page /account : profil, méthodes de connexion, demandes envoyées et suppression du compte
import React, { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Avatar from '../components/Avatar'
import GoogleButton from '../components/GoogleButton'
import PasswordInput from '../components/PasswordInput'
import { LABEL, FIELD, BUTTON, PRIMARY, SECONDARY, FIELD_ERROR } from '../components/authStyles'
import { useAuth } from '../context/AuthContext'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { LOCALES } from '../utils/format'
import { useScrollReveal } from '../utils/useScrollReveal'
import {
  updateProfile,
  changePassword,
  linkGoogle,
  unlinkGoogle,
  deleteAccount,
  fetchMyRequests,
} from '../api'

const CARD = 'w-[90vw] max-w-3xl rounded-3xl bg-white p-6 sm:p-10'
const H2 = 'text-xl sm:text-2xl font-medium tracking-tight text-slate-900'
const MUTED = 'text-sm md:text-base text-slate-600'

// Libellés des types de demande et des statuts : account.kinds et account.statuses
const STATUS_CLASSES = {
  new: 'bg-amber-50 text-amber-800',
  read: 'bg-sky-50 text-sky-800',
  in_progress: 'bg-sky-50 text-sky-800',
  answered: 'bg-emerald-50 text-emerald-800',
  done: 'bg-emerald-50 text-emerald-800',
  quoted: 'bg-sky-50 text-sky-800',
  accepted: 'bg-emerald-50 text-emerald-800',
  declined: 'bg-slate-100 text-slate-700',
}

const formatDate = (value, lang, options = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Date(value).toLocaleDateString(LOCALES[lang] || 'en-GB', options)

// Petit utilitaire : état d'envoi + messages d'erreur d'un formulaire
function useAction() {
  const [state, setState] = useState({ status: 'idle', error: '', fields: {} })
  const run = async (action) => {
    setState({ status: 'sending', error: '', fields: {} })
    try {
      const result = await action()
      setState({ status: 'done', error: '', fields: {} })
      return result
    } catch (err) {
      setState({ status: 'error', error: err.message, fields: err.fields || {} })
      return null
    }
  }
  return { ...state, sending: state.status === 'sending', run, reset: () => setState({ status: 'idle', error: '', fields: {} }) }
}

function ErrorText({ action }) {
  if (action.status !== 'error') return null
  return <p role="alert" className="text-sm md:text-base text-red-700">{action.error}</p>
}

/* ============================================================
   PROFIL : nom affiché
============================================================ */
function ProfileCard({ user, onUpdated }) {
  const t = useT('account')
  const { lang } = useLanguage()
  const [editing, setEditing] = useState(false)
  const action = useAction()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const { name } = Object.fromEntries(new FormData(event.currentTarget))
    const result = await action.run(() => updateProfile({ name }))
    if (result) {
      onUpdated(result.user, t('nameUpdated'))
      setEditing(false)
    }
  }

  return (
    <div className={CARD}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <Avatar user={user} className="w-20 h-20 text-3xl" />
        <div className="min-w-0 flex-1">
          <p className={MUTED}>{t('hello')}</p>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-forest break-words">{user.name}</h1>
        </div>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className={`self-start sm:self-center ${SECONDARY}`}>
            {t('editName')}
          </button>
        )}
      </div>

      {editing && (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="profile-name" className={LABEL}>{t('name')}</label>
            <input id="profile-name" name="name" defaultValue={user.name} required maxLength={120} autoComplete="name" className={FIELD} />
            {action.fields.name && <p className={FIELD_ERROR}>{action.fields.name}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={action.sending} className={PRIMARY}>{action.sending ? t('saving') : t('save')}</button>
            <button type="button" onClick={() => { setEditing(false); action.reset() }} className={SECONDARY}>{t('cancel')}</button>
          </div>
          <ErrorText action={action} />
        </form>
      )}

      <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-200 pt-8">
        <div className="min-w-0">
          <dt className="text-sm text-slate-500">{t('email')}</dt>
          <dd className="mt-1 text-base md:text-lg text-slate-800 break-words">{user.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">{t('memberSince')}</dt>
          <dd className="mt-1 text-base md:text-lg text-slate-800">{formatDate(user.createdAt, lang, { month: 'long', year: 'numeric' })}</dd>
        </div>
        {user.role === 'admin' && (
          <div>
            <dt className="text-sm text-slate-500">{t('role')}</dt>
            <dd className="mt-1 text-base md:text-lg text-slate-800">{t('admin')}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}

/* ============================================================
   CONNEXION : Google + mot de passe
============================================================ */
function GoogleRow({ user, onUpdated }) {
  const t = useT('account')
  const action = useAction()

  const handleLink = (credential) =>
    action.run(() => linkGoogle(credential)).then((result) => result && onUpdated(result.user, t('googleConnected')))

  const handleUnlink = () =>
    action.run(() => unlinkGoogle()).then((result) => result && onUpdated(result.user, t('googleDisconnected')))

  return (
    <div className="flex flex-col gap-4 py-6 border-b border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-base md:text-lg font-medium text-slate-900">Google</p>
          <p className={MUTED}>
            {user.hasGoogle ? t('googleOn') : t('googleOff')}
          </p>
        </div>
        {user.hasGoogle && (
          <button
            type="button"
            onClick={handleUnlink}
            disabled={action.sending || !user.hasPassword}
            title={user.hasPassword ? undefined : t('setPasswordFirst')}
            className={`self-start sm:self-center disabled:cursor-not-allowed ${SECONDARY}`}
          >
            {action.sending ? t('wait') : t('disconnect')}
          </button>
        )}
      </div>
      {user.hasGoogle && !user.hasPassword && (
        <p className="text-xs sm:text-sm text-slate-500">{t('disconnectHint')}</p>
      )}
      {!user.hasGoogle && (
        <div className="max-w-sm">
          <GoogleButton onCredential={handleLink} text="continue_with" />
        </div>
      )}
      <ErrorText action={action} />
    </div>
  )
}

function PasswordRow({ user, onUpdated }) {
  const t = useT('account')
  const [open, setOpen] = useState(false)
  const action = useAction()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const { currentPassword, newPassword } = Object.fromEntries(new FormData(event.currentTarget))
    const result = await action.run(() => changePassword({ currentPassword, newPassword }))
    if (result) {
      onUpdated(result.user, user.hasPassword
        ? t('passwordChanged')
        : t('passwordSet'))
      setOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-base md:text-lg font-medium text-slate-900">{t('emailPassword')}</p>
          <p className={MUTED}>{user.hasPassword ? t('hasPassword') : t('noPassword')}</p>
        </div>
        {!open && (
          <button type="button" onClick={() => setOpen(true)} className={`self-start sm:self-center ${SECONDARY}`}>
            {user.hasPassword ? t('changePassword') : t('setPassword')}
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {user.hasPassword && (
            <div>
              <label htmlFor="pw-current" className={LABEL}>{t('currentPassword')}</label>
              <PasswordInput id="pw-current" name="currentPassword" required autoComplete="current-password" />
              {action.fields.currentPassword && <p className={FIELD_ERROR}>{action.fields.currentPassword}</p>}
            </div>
          )}
          <div>
            <label htmlFor="pw-new" className={LABEL}>{t('newPassword')}</label>
            <PasswordInput id="pw-new" name="newPassword" required minLength={8} maxLength={72} autoComplete="new-password" />
            {action.fields.newPassword
              ? <p className={FIELD_ERROR}>{action.fields.newPassword}</p>
              : <p className="mt-1 pl-6 text-xs sm:text-sm text-slate-500">{t('minLength')}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={action.sending} className={PRIMARY}>{action.sending ? t('saving') : t('savePassword')}</button>
            <button type="button" onClick={() => { setOpen(false); action.reset() }} className={SECONDARY}>{t('cancel')}</button>
          </div>
          {!action.fields.currentPassword && !action.fields.newPassword && <ErrorText action={action} />}
        </form>
      )}
    </div>
  )
}

/* ============================================================
   DEMANDES ENVOYÉES
============================================================ */
function RequestsCard() {
  const t = useT('account')
  const { lang } = useLanguage()
  const [state, setState] = useState({ status: 'loading', requests: [], error: '' })

  useEffect(() => {
    let cancelled = false
    fetchMyRequests()
      .then(({ requests }) => !cancelled && setState({ status: 'ready', requests, error: '' }))
      .catch((err) => !cancelled && setState({ status: 'error', requests: [], error: err.message }))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className={CARD}>
      <h2 className={H2}>{t('requests')}</h2>
      <p className={`mt-2 ${MUTED}`}>{t('requestsText')}</p>

      {state.status === 'loading' && <p role="status" className={`mt-6 ${MUTED}`}>{t('loading')}</p>}
      {state.status === 'error' && <p role="alert" className="mt-6 text-sm md:text-base text-red-700">{state.error}</p>}

      {state.status === 'ready' && state.requests.length === 0 && (
        <div className="mt-6 rounded-3xl bg-[#D5E8E2]/60 p-6">
          <p className="text-base text-slate-800">{t('noRequests')}</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link to="/tailor-made" className={`text-center bg-[#C49849] hover:bg-[#b08339] active:scale-95 transition text-white ${BUTTON}`}>
              {t('planTrip')}
            </Link>
            <Link to="/contact" className={`text-center ${SECONDARY}`}>{t('contact')}</Link>
          </div>
        </div>
      )}

      {state.requests.length > 0 && (
        <ul className="mt-6 divide-y divide-slate-200">
          {state.requests.map((request) => {
            const status = {
              text: t('statuses')[request.status] || request.status,
              className: STATUS_CLASSES[request.status] || 'bg-slate-100 text-slate-700',
            }
            return (
              <li key={`${request.kind}-${request.id}`} className="py-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
                <div className="min-w-0 flex-1">
                  <p className="text-base md:text-lg font-medium text-slate-900">
                    {t('kinds')[request.kind] || request.kind}
                    {request.subject && <span className="font-normal text-slate-600"> · {request.subject}</span>}
                  </p>
                  {request.details && <p className={`mt-1 line-clamp-2 break-words ${MUTED}`}>{request.details}</p>}
                  <p className="mt-1 text-xs sm:text-sm text-slate-500">{formatDate(request.createdAt, lang)}</p>
                </div>
                <span className={`self-start shrink-0 rounded-full px-3 py-1 text-xs sm:text-sm font-medium ${status.className}`}>
                  {status.text}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ============================================================
   SUPPRESSION DU COMPTE
============================================================ */
function DeleteCard({ user, onDeleted }) {
  const t = useT('account')
  const [open, setOpen] = useState(false)
  const action = useAction()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const result = await action.run(() => deleteAccount(data))
    if (result) onDeleted()
  }

  return (
    <div className={CARD}>
      <h2 className={H2}>{t('deleteTitle')}</h2>
      <p className={`mt-2 ${MUTED}`}>
        {t('deleteText')}
      </p>

      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className={`mt-6 border border-red-300 text-red-700 hover:border-red-700 active:scale-95 transition ${BUTTON}`}>
          {t('deleteTitle')}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {user.hasPassword ? (
            <div>
              <label htmlFor="delete-password" className={LABEL}>{t('confirmPassword')}</label>
              <PasswordInput id="delete-password" name="password" required autoComplete="current-password" />
              {action.fields.password && <p className={FIELD_ERROR}>{action.fields.password}</p>}
            </div>
          ) : (
            <div>
              <label htmlFor="delete-email" className={LABEL}>{t('confirmEmail')}</label>
              <input id="delete-email" name="confirmEmail" type="email" required autoComplete="off" placeholder={user.email} className={FIELD} />
              {action.fields.confirmEmail && <p className={FIELD_ERROR}>{action.fields.confirmEmail}</p>}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={action.sending} className={`bg-red-700 hover:bg-red-800 active:scale-95 transition text-white disabled:opacity-60 disabled:cursor-wait ${BUTTON}`}>
              {action.sending ? t('deleting') : t('deleteForGood')}
            </button>
            <button type="button" onClick={() => { setOpen(false); action.reset() }} className={SECONDARY}>{t('cancel')}</button>
          </div>
          {!action.fields.password && !action.fields.confirmEmail && <ErrorText action={action} />}
        </form>
      )}
    </div>
  )
}

/* ============================================================
   PAGE
============================================================ */
function Account() {
  const { user, loading, logout, updateUser } = useAuth()
  const t = useT('account')
  const navigate = useNavigate()
  const location = useLocation()
  // Message de confirmation (ex. après réinitialisation du mot de passe, ou après une modification)
  const [notice, setNotice] = useState(location.state?.notice || '')

  // Le message a été lu : on l'efface de l'historique pour qu'il ne revienne pas au rafraîchissement
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  const root = useRef(null)
  useScrollReveal(root, [loading, !!user])

  if (loading) {
    return (
      <section className="w-full min-h-screen bg-[#D5E8E2] flex flex-col items-center">
        <Navbar />
        <p role="status" className="mt-20 text-slate-600">{t('loading')}</p>
      </section>
    )
  }
  if (!user) return <Navigate to="/login?next=/account" replace />

  const handleUpdated = (nextUser, message) => {
    updateUser(nextUser)
    setNotice(message)
    // Le message s'affiche en haut de page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // On quitte la page d'abord : sinon, dès que user devient null, cette page redirige vers /login
  const handleLogout = async () => {
    navigate('/', { replace: true })
    await logout()
  }

  const handleDeleted = () => {
    navigate('/', { replace: true })
    window.google?.accounts?.id?.disableAutoSelect()
    updateUser(null)
  }

  return (
    <>
      <section ref={root} className="w-full pt-0 pb-12 md:pb-20 bg-[#D5E8E2] flex flex-col items-center gap-6">
        <Navbar />

        {notice && (
          <div role="status" className="w-[90vw] max-w-3xl mt-4 flex items-start justify-between gap-4 rounded-3xl bg-emerald-50 px-6 py-4 text-sm md:text-base text-emerald-800">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')} aria-label={t('closeMessage')} className="shrink-0 font-medium hover:underline">
              {t('ok')}
            </button>
          </div>
        )}

        <div className={notice ? '' : 'mt-4'}>
          <ProfileCard user={user} onUpdated={handleUpdated} />
        </div>

        <div className={CARD}>
          <h2 className={H2}>{t('signIn')}</h2>
          <GoogleRow user={user} onUpdated={handleUpdated} />
          <PasswordRow user={user} onUpdated={handleUpdated} />
        </div>

        <RequestsCard />

        <DeleteCard user={user} onDeleted={handleDeleted} />

        <div className="w-[90vw] max-w-3xl flex flex-col sm:flex-row gap-3">
          {user.role === 'admin' && (
            <Link to="/admin" className={`text-center bg-[#084838] hover:bg-[#0a5c47] active:scale-95 transition text-white ${BUTTON}`}>
              {t('adminLink')}
            </Link>
          )}
          <Link to="/tailor-made" className={`text-center bg-[#C49849] hover:bg-[#b08339] active:scale-95 transition text-white ${BUTTON}`}>
            {t('planTrip')}
          </Link>
          <button type="button" onClick={handleLogout} className={`bg-white ${SECONDARY}`}>
            {t('logout')}
          </button>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default Account
