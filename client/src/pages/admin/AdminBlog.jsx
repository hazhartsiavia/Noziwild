// /admin/blog : articles du journal, les plus récents d'abord ; publication et « à la une » en un clic
import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Eye, EyeOff, Pencil, Plus, Star, Trash } from 'lucide-react'
import { adminDeletePost, adminFetchPosts, adminPatchPost, assetUrl } from '../../api'
import { formatDate } from '../../utils/format'
import { BTN_DANGER, BTN_GHOST, BTN_GOLD, CARD, ICON_BTN } from '../../components/admin/ui'

function AdminBlog() {
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = useCallback(() => {
    adminFetchPosts()
      .then(({ posts: list }) => setPosts(list))
      .catch((err) => setError(err.message))
  }, [])

  useEffect(load, [load])

  const run = async (slug, action, message) => {
    setBusy(slug)
    setError('')
    try {
      await action()
      setNotice(message)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  const featuredCount = posts ? posts.filter((p) => p.isFeatured && p.isPublished).length : 0

  return (
    <section aria-labelledby="blog-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="blog-title" className="text-xl sm:text-2xl font-medium text-forest">Blog</h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Articles are shown newest first on{' '}
            <a href="/blog" target="_blank" rel="noreferrer" className="font-medium text-[#a9813a] hover:underline">/blog</a>.
            The 3 newest starred articles go in the “featured” block at the top{featuredCount > 3 ? ` (${featuredCount} are starred: only 3 are shown)` : ''}.
          </p>
        </div>
        <Link to="/admin/blog/new" className={BTN_GOLD}>
          <Plus size={16} aria-hidden="true" /> New article
        </Link>
      </div>

      {notice && (
        <div role="status" className="mt-4 flex items-start justify-between gap-4 rounded-2xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="font-medium hover:underline">OK</button>
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-800">{error}</p>}

      {!posts && !error && <p role="status" className="mt-6 text-slate-600">Loading…</p>}

      {posts && posts.length === 0 && (
        <div className={`${CARD} mt-6 text-center`}>
          <p className="text-slate-700">No article yet.</p>
          <Link to="/admin/blog/new" className={`mt-4 ${BTN_GOLD}`}>Write the first one</Link>
        </div>
      )}

      {posts && posts.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {posts.map((p) => (
            <li key={p.slug} className={`rounded-3xl bg-white p-3 sm:p-4 flex flex-col md:flex-row md:items-center gap-4 ${busy === p.slug ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <img src={assetUrl(p.image)} alt="" className="h-16 w-24 sm:h-20 sm:w-28 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-base sm:text-lg font-medium text-slate-900">{p.title}</span>
                    {p.isFeatured && <span className="rounded-full bg-[#C49849]/15 px-2.5 py-0.5 text-xs font-medium text-[#8a6a2e]">Featured</span>}
                    {!p.isPublished && <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">Hidden</span>}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{formatDate(p.date, 'en')} · {p.minutes} min read · {p.body.length} blocks</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 md:justify-end">
                <button
                  type="button"
                  onClick={() => run(p.slug, () => adminPatchPost(p.slug, { isFeatured: !p.isFeatured }), `"${p.title}" is ${p.isFeatured ? 'no longer' : 'now'} featured.`)}
                  disabled={Boolean(busy)}
                  aria-label={p.isFeatured ? `Remove "${p.title}" from the featured block` : `Feature "${p.title}"`}
                  title={p.isFeatured ? 'Featured: click to remove' : 'Click to feature'}
                  className={`${ICON_BTN} ${p.isFeatured ? 'text-[#C49849]' : ''}`}
                >
                  <Star size={17} aria-hidden="true" fill={p.isFeatured ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={() => run(p.slug, () => adminPatchPost(p.slug, { isPublished: !p.isPublished }), `"${p.title}" is now ${p.isPublished ? 'hidden from' : 'visible on'} the site.`)}
                  disabled={Boolean(busy)}
                  aria-label={p.isPublished ? `Hide "${p.title}" from the site` : `Publish "${p.title}"`}
                  title={p.isPublished ? 'Visible on the site: click to hide' : 'Hidden: click to publish'}
                  className={ICON_BTN}
                >
                  {p.isPublished ? <Eye size={17} aria-hidden="true" /> : <EyeOff size={17} aria-hidden="true" />}
                </button>
                <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" aria-label={`Open "${p.title}" (new tab)`} className={ICON_BTN}>
                  <ExternalLink size={17} aria-hidden="true" />
                </a>
                <Link to={`/admin/blog/${p.slug}`} className={`ml-1 ${BTN_GHOST}`}>
                  <Pencil size={15} aria-hidden="true" /> Edit
                </Link>
                {confirmDelete === p.slug ? (
                  <span className="ml-1 flex items-center gap-1">
                    <button type="button" onClick={() => { setConfirmDelete(null); run(p.slug, () => adminDeletePost(p.slug), `"${p.title}" was deleted.`) }} className={BTN_DANGER}>Confirm delete</button>
                    <button type="button" onClick={() => setConfirmDelete(null)} className={BTN_GHOST}>Cancel</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(p.slug)} disabled={Boolean(busy)} aria-label={`Delete "${p.title}"`} className={`${ICON_BTN} hover:text-red-700`}>
                    <Trash size={17} aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default AdminBlog
