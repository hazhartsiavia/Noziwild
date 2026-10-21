// Cadre de l'espace admin (/admin/...) : réservé aux comptes "admin", onglets Circuits / Offers / Inbox
import React from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Inbox, LayoutGrid, Map } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'

const TABS = [
  { to: '/admin/circuits', label: 'Circuits', icon: Map },
  { to: '/admin/offers', label: 'Offers', icon: LayoutGrid },
  { to: '/admin/inbox', label: 'Inbox', icon: Inbox },
]

function Shell({ children }) {
  return (
    <main className="w-full min-h-screen bg-[#D5E8E2] pb-20 flex flex-col items-center">
      <Navbar />
      {children}
    </main>
  )
}

function AdminLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Shell>
        <p role="status" className="mt-20 text-slate-600">Loading…</p>
      </Shell>
    )
  }
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />

  if (user.role !== 'admin') {
    return (
      <Shell>
        <section className="w-[90vw] max-w-2xl mt-16 rounded-3xl bg-white p-8 sm:p-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-medium text-slate-900">Administrators only</h1>
          <p className="mt-3 text-slate-600">
            Your account ({user.email}) does not have access to this area. Ask the Noziwild team to give you the administrator role.
          </p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-slate-800 px-6 py-3 text-sm font-medium text-white hover:bg-slate-700">Back to the site</Link>
        </section>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="w-[90vw] lg:max-w-[95vw] mt-6">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-600">Noziwild</p>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-slate-900">Admin</h1>
          </div>
          <nav aria-label="Admin sections" className="flex gap-1 self-start rounded-full bg-white p-1">
            {TABS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                }
              >
                <Icon size={16} aria-hidden="true" /> {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </Shell>
  )
}

export default AdminLayout
