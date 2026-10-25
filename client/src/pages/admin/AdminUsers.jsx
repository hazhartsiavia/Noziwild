// /admin/users : comptes du site. Recherche, filtres (rôle, statut), création d'un compte
// (le nouvel utilisateur reçoit un lien pour choisir son mot de passe), et accès à la fiche de chaque compte.
import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronRight as Open, Plus, Search, X } from 'lucide-react'
import { adminCreateAccount, adminFetchAccounts } from '../../api'
import Avatar from '../../components/Avatar'
import Field from '../../components/admin/Field'
import { BTN_GHOST, BTN_GOLD, CARD, CARD_TITLE, INPUT } from '../../components/admin/ui'

export const formatDay = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

// Badges d'un compte : rôle, statut, façon de se connecter
export function AccountBadges({ account }) {
  const badge = 'rounded-full px-2.5 py-0.5 text-xs font-medium'
  return (
    <span className="flex flex-wrap gap-1.5">
      {account.role === 'admin' && <span className={`${badge} bg-[#084838] text-white`}>Admin</span>}
      {account.disabled && <span className={`${badge} bg-red-50 text-red-800`}>Suspended</span>}
      {account.hasGoogle && <span className={`${badge} bg-slate-100 text-slate-700`}>Google</span>}
      {account.hasPassword && <span className={`${badge} bg-slate-100 text-slate-700`}>Password</span>}
      {!account.hasGoogle && !account.hasPassword && <span className={`${badge} bg-amber-50 text-amber-800`}>Invited, no password yet</span>}
    </span>
  )
}

function NewAccount({ onCreated, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'user' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    setError('')
    try {
      const { account } = await adminCreateAccount(form)
      onCreated(account)
    } catch (err) {
      setErrors(err.fields || {})
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className={`${CARD} mt-6`} aria-labelledby="new-account-title">
      <div className="flex items-center justify-between gap-3">
        <h3 id="new-account-title" className={CARD_TITLE}>New account</h3>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X size={18} aria-hidden="true" /></button>
      </div>
      <p className="mt-1 text-sm text-slate-600">The person receives an email with a link to choose a password (valid 7 days). They can also sign in with Google.</p>
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-800">{error}</p>}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-[1fr_1fr_180px] gap-4 items-start">
        <Field label="Name" error={errors.name}>
          {(p) => <input {...p} value={form.name} onChange={set('name')} autoComplete="off" className={INPUT} />}
        </Field>
        <Field label="Email" error={errors.email}>
          {(p) => <input {...p} type="email" value={form.email} onChange={set('email')} autoComplete="off" className={INPUT} />}
        </Field>
        <Field label="Role" error={errors.role}>
          {(p) => (
            <select {...p} value={form.role} onChange={set('role')} className={INPUT}>
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </select>
          )}
        </Field>
      </div>
      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={busy} className={BTN_GOLD}><Plus size={16} aria-hidden="true" /> {busy ? 'Creating…' : 'Create and send the link'}</button>
        <button type="button" onClick={onClose} className={BTN_GHOST}>Cancel</button>
      </div>
    </form>
  )
}

function AdminUsers() {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') || ''
  const role = params.get('role') || 'all'
  const status = params.get('status') || 'all'
  const page = Math.max(Number(params.get('page')) || 1, 1)
  const [query, setQuery] = useState(search)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    setError('')
    adminFetchAccounts({ search, role, status, page })
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [search, role, status, page])

  // La recherche part 300 ms après la dernière lettre
  useEffect(() => {
    if (query === search) return undefined
    const timer = setTimeout(() => update({ search: query }), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const update = (changes) => {
    const next = { search, role, status, page: 1, ...changes }
    setParams(Object.fromEntries(Object.entries(next).filter(([k, v]) => v && v !== 'all' && !(k === 'page' && v === 1))))
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1
  const pill = (active) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'bg-[#084838] text-white' : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-700'}`

  return (
    <section aria-labelledby="users-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="users-title" className="text-xl sm:text-2xl font-medium text-forest">Users</h2>
          {data && (
            <p className="text-sm text-slate-600">
              {data.counts.everyone} {data.counts.everyone === 1 ? 'account' : 'accounts'} · {data.counts.admins}{' '}
              {data.counts.admins === 1 ? 'administrator' : 'administrators'}{data.counts.suspended ? ` · ${data.counts.suspended} suspended` : ''}
            </p>
          )}
        </div>
        {!creating && (
          <button type="button" onClick={() => { setCreating(true); setNotice('') }} className={BTN_GOLD}>
            <Plus size={16} aria-hidden="true" /> New account
          </button>
        )}
      </div>

      {creating && (
        <NewAccount
          onClose={() => setCreating(false)}
          onCreated={(account) => {
            setCreating(false)
            setNotice(`Account created for ${account.email}: an email with a link to choose a password is on its way.`)
            update({ search: '', role: 'all', status: 'all' })
            setQuery('')
          }}
        />
      )}

      {notice && (
        <div role="status" className="mt-4 flex items-start justify-between gap-4 rounded-2xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="font-medium hover:underline">OK</button>
        </div>
      )}

      <div className="mt-6 flex flex-col lg:flex-row lg:items-center gap-3">
        <label className="relative block w-full lg:w-80">
          <span className="sr-only">Search by name or email</span>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" className={`${INPUT} pl-10`} />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Role">
          {[['all', 'Everyone'], ['admin', 'Administrators'], ['user', 'Users']].map(([value, label]) => (
            <button key={value} type="button" aria-pressed={role === value} onClick={() => update({ role: value })} className={pill(role === value)}>{label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Status">
          {[['all', 'All'], ['active', 'Active'], ['suspended', 'Suspended']].map(([value, label]) => (
            <button key={value} type="button" aria-pressed={status === value} onClick={() => update({ status: value })} className={pill(status === value)}>{label}</button>
          ))}
        </div>
      </div>

      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-800">{error}</p>}
      {!data && !error && <p role="status" className="mt-6 text-slate-600">Loading…</p>}

      {data && data.accounts.length === 0 && (
        <div className={`${CARD} mt-6 text-center text-slate-700`}>No account matches these filters.</div>
      )}

      {data && data.accounts.length > 0 && (
        <ul className="mt-6 flex flex-col gap-2">
          {data.accounts.map((a) => (
            <li key={a.id}>
              <Link to={`/admin/users/${a.id}`} className={`group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-3xl bg-white p-4 transition hover:ring-2 hover:ring-[#084838] ${a.disabled ? 'opacity-70' : ''}`}>
                <span className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar user={a} className="h-11 w-11 text-base" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-900">{a.name}</span>
                    <span className="block truncate text-sm text-slate-600">{a.email}</span>
                  </span>
                </span>
                <AccountBadges account={a} />
                <span className="text-xs text-slate-500 sm:w-48 sm:text-right">
                  Joined {formatDay(a.createdAt)}<br className="hidden sm:block" />
                  <span className="sm:hidden"> · </span>
                  {a.lastLoginAt ? `Last login ${formatDay(a.lastLoginAt)}` : 'Never signed in'}
                  {a.requests ? ` · ${a.requests} request${a.requests > 1 ? 's' : ''}` : ''}
                </span>
                <Open size={18} aria-hidden="true" className="hidden sm:block shrink-0 text-slate-400 group-hover:text-slate-700" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && pages > 1 && (
        <nav aria-label="Pages" className="mt-6 flex items-center justify-center gap-3">
          <button type="button" onClick={() => update({ page: page - 1 })} disabled={page <= 1} className={BTN_GHOST}><ChevronLeft size={16} aria-hidden="true" /> Previous</button>
          <span className="text-sm text-slate-600">Page {page} of {pages}</span>
          <button type="button" onClick={() => update({ page: page + 1 })} disabled={page >= pages} className={BTN_GHOST}>Next <ChevronRight size={16} aria-hidden="true" /></button>
        </nav>
      )}
    </section>
  )
}

export default AdminUsers
