// /admin/users/:id : fiche d'un compte. Nom, rôle, suspension, lien de mot de passe, déconnexion partout,
// suppression, et les demandes envoyées depuis ce compte.
import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Ban, KeyRound, LogOut, Save, ShieldCheck, ShieldOff, Trash, UserCheck } from 'lucide-react'
import {
  adminDeleteAccount,
  adminFetchAccount,
  adminSendPasswordLink,
  adminSignOutAccount,
  adminUpdateAccount,
} from '../../api'
import Avatar from '../../components/Avatar'
import { BTN_DANGER, BTN_GHOST, BTN_GOLD, CARD, CARD_TITLE, INPUT } from '../../components/admin/ui'
import { AccountBadges, formatDay } from './AdminUsers'

const KINDS = {
  quote: 'Quote', contact: 'Contact', 'tailor-made': 'Tailor-made', place: 'Place inquiry', gear: 'Equipment',
  food: 'Food journey', trip: 'Trip idea', circuit: 'Circuit',
}
const STATUS = { new: 'New', read: 'Read', answered: 'Answered', in_progress: 'In progress', done: 'Done', quoted: 'Quote sent', accepted: 'Accepted', declined: 'Declined' }

function AdminUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null) // { account, requests, isSelf }
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState('')

  const load = useCallback(() => {
    adminFetchAccount(id)
      .then((result) => {
        setData(result)
        setName(result.account.name)
      })
      .catch((err) => setError(err.status === 404 ? 'This account does not exist (any more).' : err.message))
  }, [id])

  useEffect(load, [load])

  if (!data) {
    return error ? (
      <div className={`${CARD} text-center`}>
        <p role="alert" className="text-slate-700">{error}</p>
        <Link to="/admin/users" className={`mt-4 ${BTN_GHOST}`}>Back to users</Link>
      </div>
    ) : (
      <p role="status" className="text-slate-600">Loading…</p>
    )
  }

  const { account, requests, isSelf } = data

  const run = async (action, message) => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await action()
      setNotice(message)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    setError('')
    try {
      await adminDeleteAccount(account.id)
      navigate('/admin/users', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const row = (label, value) => (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{value}</dd>
    </div>
  )

  return (
    <div className="pb-10">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:underline">
        <ArrowLeft size={15} aria-hidden="true" /> All users
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <Avatar user={account} className="h-14 w-14 text-xl" />
        <div className="min-w-0">
          <h2 className="truncate text-xl sm:text-2xl font-medium text-forest">{account.name}{isSelf ? ' (you)' : ''}</h2>
          <p className="truncate text-sm text-slate-600">{account.email}</p>
        </div>
        <AccountBadges account={account} />
      </div>

      {notice && <p role="status" className="mt-4 rounded-2xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-800">{error}</p>}

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <section className={CARD} aria-labelledby="account-info">
            <h3 id="account-info" className={CARD_TITLE}>Account</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                run(() => adminUpdateAccount(account.id, { name }), 'Name saved.')
              }}
              className="mt-4 flex flex-col sm:flex-row gap-2"
            >
              <label htmlFor="account-name" className="sr-only">Name</label>
              <input id="account-name" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
              <button type="submit" disabled={busy || !name.trim() || name === account.name} className={BTN_GOLD}><Save size={16} aria-hidden="true" /> Save</button>
            </form>
            <dl className="mt-4 divide-y divide-slate-100">
              {row('Joined', formatDay(account.createdAt))}
              {row('Last login', account.lastLoginAt ? formatDay(account.lastLoginAt) : 'Never')}
              {row('Email verified', account.emailVerified ? 'Yes' : 'Not yet')}
              {row('Sign-in', [account.hasGoogle && 'Google', account.hasPassword && 'Password'].filter(Boolean).join(' + ') || 'No password yet (invited)')}
              {account.disabled && row('Suspended since', formatDay(account.disabledAt))}
            </dl>
          </section>

          <section className={CARD} aria-labelledby="account-requests">
            <h3 id="account-requests" className={CARD_TITLE}>Requests <span className="text-sm font-normal text-slate-500">({requests.length})</span></h3>
            {requests.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No request sent from this account yet.</p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-slate-100">
                {requests.map((r) => (
                  <li key={`${r.kind}-${r.id}`} className="py-3">
                    <p className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-slate-900">{KINDS[r.kind] || r.kind}{r.kind === 'quote' ? ` #${r.id}` : ''}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">{STATUS[r.status] || r.status}</span>
                      <span className="text-xs text-slate-500">{formatDay(r.createdAt)}</span>
                    </p>
                    {(r.subject || r.details) && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{[r.subject, r.details].filter(Boolean).join(' · ')}</p>}
                  </li>
                ))}
              </ul>
            )}
            {requests.length > 0 && <Link to="/admin/inbox" className="mt-3 inline-block text-sm font-medium text-[#a9813a] hover:underline">Answer them in the Inbox</Link>}
          </section>
        </div>

        <section className={`${CARD} flex flex-col gap-3`} aria-labelledby="account-actions">
          <h3 id="account-actions" className={CARD_TITLE}>Actions</h3>

          {isSelf ? (
            <p className="text-sm text-slate-600">This is your account: your role and status can only be changed by another administrator.</p>
          ) : (
            <>
              {account.role === 'admin' ? (
                <button type="button" disabled={busy} onClick={() => run(() => adminUpdateAccount(account.id, { role: 'user' }), `${account.name} is no longer an administrator.`)} className={BTN_GHOST}>
                  <ShieldOff size={16} aria-hidden="true" /> Remove administrator role
                </button>
              ) : (
                <button type="button" disabled={busy || account.disabled} onClick={() => run(() => adminUpdateAccount(account.id, { role: 'admin' }), `${account.name} is now an administrator: they can open /admin.`)} className={BTN_GHOST}>
                  <ShieldCheck size={16} aria-hidden="true" /> Make administrator
                </button>
              )}

              {account.disabled ? (
                <button type="button" disabled={busy} onClick={() => run(() => adminUpdateAccount(account.id, { disabled: false }), 'Account reactivated: they can sign in again.')} className={BTN_GHOST}>
                  <UserCheck size={16} aria-hidden="true" /> Reactivate the account
                </button>
              ) : (
                <button type="button" disabled={busy} onClick={() => run(() => adminUpdateAccount(account.id, { disabled: true }), 'Account suspended: they are signed out and cannot sign in.')} className={BTN_GHOST}>
                  <Ban size={16} aria-hidden="true" /> Suspend the account
                </button>
              )}
            </>
          )}

          <button type="button" disabled={busy || account.disabled} onClick={() => run(() => adminSendPasswordLink(account.id), `A link to choose a new password was sent to ${account.email} (valid 1 hour).`)} className={BTN_GHOST}>
            <KeyRound size={16} aria-hidden="true" /> Send a password link
          </button>
          <button type="button" disabled={busy} onClick={() => run(() => adminSignOutAccount(account.id), 'Signed out on every device.')} className={BTN_GHOST}>
            <LogOut size={16} aria-hidden="true" /> Sign out everywhere
          </button>

          {!isSelf && (
            <div className="mt-3 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-600">
                Delete the account for good. Their requests stay in the Inbox, without the link to the account.
              </p>
              <label htmlFor="confirm-delete" className="mt-3 block text-xs text-slate-500">Type the email address to confirm</label>
              <input id="confirm-delete" value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} placeholder={account.email} autoComplete="off" className={`${INPUT} mt-1`} />
              <button
                type="button"
                disabled={busy || confirmDelete.trim().toLowerCase() !== account.email.toLowerCase()}
                onClick={remove}
                className={`mt-2 w-full ${BTN_DANGER}`}
              >
                <Trash size={16} aria-hidden="true" /> Delete the account
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminUser
