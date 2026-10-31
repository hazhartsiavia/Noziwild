// Référencement : ce que Google et les aperçus de liens (WhatsApp, Facebook...) lisent sans lancer React.
//   - balises de chaque page (titre, description, adresse canonique, versions dans les autres langues,
//     aperçu de partage, données structurées), posées dans index.html avant de l'envoyer ;
//   - robots.txt et sitemap.xml.
// Langues : l'anglais sans préfixe (/circuits), les autres avec (/fr/circuits), comme sur le site React.
// Textes des pages fixes : seoPages.js. Circuits, destinations et articles : leurs traductions en base.
// SITE_URL (ex. https://madanoziwild.com) : adresse officielle du site. Vide : l'adresse de la requête.
import pool from '../config/db.js'
import { LANGUAGES, toCircuitCard } from './circuits.js'
import { toDestination } from './destinations.js'
import { toPostCard } from './posts.js'
import { PAGES, WORDS } from './seoPages.js'

const SITE_NAME = 'Noziwild'
const DEFAULT_IMAGE = '/og-image.jpg'
const ALL_LANGUAGES = ['en', ...LANGUAGES]
const LOCALES = { en: 'en_US', fr: 'fr_FR', de: 'de_DE', it: 'it_IT', es: 'es_ES' }

// Pages renommées : ancienne adresse -> nouvelle, redirigée en 301 dans chaque langue
// (même liste côté site React : client/src/i18n/paths.js)
const RENAMED_PAGES = {
  '/excurssions': '/excursions',
  '/cruise-excurssion': '/cruise-excursions',
  '/hosting': '/accommodation',
  '/longstay': '/long-stay',
  '/guide': '/guides',
}

// Pages personnelles ou techniques : jamais dans Google (le site les affiche quand même)
const PRIVATE_PAGES = ['/my-trip', '/login', '/register', '/forgot-password', '/reset-password', '/account']
const isPrivate = (path) => PRIVATE_PAGES.includes(path) || path === '/admin' || path.startsWith('/admin/')

export function siteUrl(req) {
  return (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '')
}

// /Fr/Circuits/ -> { lang: 'fr', path: '/circuits' } (React Router ignore les majuscules et la barre finale)
function splitPath(pathname) {
  const clean = (pathname.replace(/\/+$/, '') || '/').toLowerCase()
  const first = clean.split('/')[1]
  if (!LANGUAGES.includes(first)) return { lang: 'en', path: clean }
  return { lang: first, path: clean.slice(first.length + 1) || '/' }
}

// Adresse d'une page dans une langue : ('/circuits', 'fr') -> /fr/circuits ; ('/', 'fr') -> /fr
const localPath = (path, lang) => (lang === 'en' ? path : path === '/' ? `/${lang}` : `/${lang}${path}`)

// Adresse complète d'une photo (/uploads/... ou déjà complète)
const absolute = (base, url) => (/^https?:\/\//i.test(url) ? url : `${base}${url.startsWith('/') ? '' : '/'}${url}`)

// Coupe une description trop longue au dernier mot entier
function shorten(text, max = 160) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

// MySQL renvoie le JSON déjà décodé, MariaDB (XAMPP) le renvoie en texte
function parseJson(value, fallback) {
  if (value === null || value === undefined) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const toIso = (value) => (value instanceof Date ? value.toISOString() : value ? String(value) : undefined)

/* ------------------------------------------------------------------
   Données structurées (schema.org), lues par Google pour enrichir les résultats
------------------------------------------------------------------ */
function organization(base, lang) {
  return {
    '@type': 'TravelAgency',
    '@id': `${base}/#organization`,
    name: SITE_NAME,
    url: `${base}/`,
    logo: `${base}/favicon.svg`,
    image: `${base}${DEFAULT_IMAGE}`,
    description: WORDS[lang].description,
    address: { '@type': 'PostalAddress', addressLocality: 'Antananarivo', addressCountry: 'MG' },
    areaServed: { '@type': 'Country', name: 'Madagascar' },
  }
}

function breadcrumbs(base, lang, items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${base}${localPath(path, lang)}`,
    })),
  }
}

/* ------------------------------------------------------------------
   Pages tirées de la base : circuits, destinations, lieux, articles, dans la langue demandée
   (un texte non traduit reste en anglais). null : l'élément n'existe pas (ou n'est pas publié) -> 404
------------------------------------------------------------------ */
async function circuitMeta(base, lang, slug) {
  const [[row]] = await pool.execute('SELECT * FROM circuits WHERE slug = ? AND is_published = 1', [slug])
  if (!row) return null
  const circuit = toCircuitCard(row, lang)
  const w = WORDS[lang]
  const url = `${base}${localPath(`/circuits/${row.slug}`, lang)}`
  return {
    title: `${w.circuit(circuit.title, row.days)} | ${SITE_NAME}`,
    description: circuit.summary,
    image: circuit.image,
    jsonLd: [
      {
        '@type': 'TouristTrip',
        name: circuit.title,
        description: circuit.summary,
        url,
        image: absolute(base, circuit.image),
        inLanguage: lang,
        touristType: row.tour_type || undefined,
        offers: {
          '@type': 'Offer',
          price: row.price,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url,
        },
        provider: { '@id': `${base}/#organization` },
      },
      breadcrumbs(base, lang, [[w.home, '/'], [w.circuits, '/circuits'], [circuit.title, `/circuits/${row.slug}`]]),
    ],
  }
}

async function destinationOf(slug, lang) {
  const [[row]] = await pool.execute('SELECT * FROM destinations WHERE slug = ? AND is_published = 1', [slug])
  return row ? toDestination(row, lang) : null
}

async function destinationMeta(base, lang, slug) {
  const d = await destinationOf(slug, lang)
  if (!d) return null
  const w = WORDS[lang]
  const path = `/destinations/${d.slug}`
  const intro = (d.intro || [])[0] || ''
  const description = d.tagline ? `${d.tagline}. ${intro}` : intro
  return {
    title: `${w.destination(d.name)} | ${SITE_NAME}`,
    description,
    image: d.image,
    jsonLd: [
      {
        '@type': 'TouristDestination',
        name: d.name,
        description: shorten(description, 300),
        url: `${base}${localPath(path, lang)}`,
        image: absolute(base, d.image),
        inLanguage: lang,
        containedInPlace: { '@type': 'Country', name: 'Madagascar' },
        includesAttraction: d.visit.map((place) => ({
          '@type': 'TouristAttraction',
          name: place.name,
          url: `${base}${localPath(`${path}/${place.slug}`, lang)}`,
        })),
      },
      breadcrumbs(base, lang, [[w.home, '/'], [w.destinations, '/destinations'], [d.name, path]]),
    ],
  }
}

async function placeMeta(base, lang, slug, placeSlug) {
  const d = await destinationOf(slug, lang)
  const place = d?.visit.find((p) => p.slug === placeSlug)
  if (!place) return null
  const w = WORDS[lang]
  const path = `/destinations/${d.slug}/${place.slug}`
  return {
    title: `${w.place(place.name, d.name)} | ${SITE_NAME}`,
    description: place.text,
    image: place.image || d.image,
    jsonLd: [
      {
        '@type': 'TouristAttraction',
        name: place.name,
        description: place.text,
        url: `${base}${localPath(path, lang)}`,
        image: absolute(base, place.image || d.image),
        inLanguage: lang,
        containedInPlace: { '@type': 'Place', name: `${d.name}, Madagascar` },
      },
      breadcrumbs(base, lang, [
        [w.home, '/'],
        [w.destinations, '/destinations'],
        [d.name, `/destinations/${d.slug}`],
        [place.name, path],
      ]),
    ],
  }
}

async function postMeta(base, lang, slug) {
  const [[row]] = await pool.execute('SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1', [slug])
  if (!row) return null
  const post = toPostCard(row, lang)
  const w = WORDS[lang]
  const path = `/blog/${row.slug}`
  const url = `${base}${localPath(path, lang)}`
  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.excerpt,
    image: post.image,
    type: 'article',
    jsonLd: [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        url,
        mainEntityOfPage: url,
        image: absolute(base, post.image),
        inLanguage: lang,
        datePublished: post.date,
        dateModified: toIso(row.updated_at),
        author: { '@id': `${base}/#organization` },
        publisher: { '@id': `${base}/#organization` },
      },
      breadcrumbs(base, lang, [[w.home, '/'], [w.blog, '/blog'], [post.title, path]]),
    ],
  }
}

// Balises d'une adresse : { lang, title, description, image, canonical, alternates, noindex, status, jsonLd }
// ou { redirect } pour /en/... (l'anglais n'a pas de préfixe) et les pages renommées
export async function pageMeta(req) {
  const base = siteUrl(req)
  const query = req.originalUrl.slice(req.path.length)
  if (/^\/en(\/|$)/i.test(req.path)) return { redirect: (req.path.slice(3) || '/') + query }
  const { lang, path } = splitPath(req.path)
  if (RENAMED_PAGES[path]) return { redirect: localPath(RENAMED_PAGES[path], lang) + query }
  const w = WORDS[lang]
  const meta = { lang, title: `${SITE_NAME} Madagascar`, description: w.description, image: DEFAULT_IMAGE, status: 200 }
  // Même page dans chaque langue : Google montre à chacun la sienne
  const alternates = ALL_LANGUAGES.map((l) => [l, `${base}${localPath(path, l)}`])
  const canonical = `${base}${localPath(path, lang)}`

  if (isPrivate(path)) return { ...meta, noindex: true }

  const page = PAGES[path]?.[lang]
  if (page) {
    const jsonLd = path === '/' ? [organization(base, lang), { '@type': 'WebSite', name: SITE_NAME, url: `${base}/` }] : undefined
    return { ...meta, ...page, canonical, alternates, jsonLd }
  }

  const [, section, slug, placeSlug, extra] = path.split('/')
  let found
  try {
    if (section === 'circuits' && slug && !placeSlug) found = await circuitMeta(base, lang, slug)
    else if (section === 'destinations' && slug && !placeSlug) found = await destinationMeta(base, lang, slug)
    else if (section === 'destinations' && placeSlug && !extra) found = await placeMeta(base, lang, slug, placeSlug)
    else if (section === 'blog' && slug && !placeSlug) found = await postMeta(base, lang, slug)
  } catch (error) {
    // Base injoignable : balises par défaut, sans dire 404 (la page existe peut-être)
    console.error('Balises SEO non lues :', error.code || error.message)
    return { ...meta, canonical, alternates }
  }
  // Adresse inconnue : React affiche la page, mais Google doit savoir qu'elle n'existe pas
  if (!found) return { ...meta, title: `${w.notFound} | ${SITE_NAME}`, noindex: true, status: 404 }
  return { ...meta, ...found, description: shorten(found.description), canonical, alternates }
}

/* ------------------------------------------------------------------
   Pose des balises dans index.html
------------------------------------------------------------------ */
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export function renderHead(html, meta, req) {
  const base = siteUrl(req)
  const image = absolute(base, meta.image || DEFAULT_IMAGE)
  const alternates = meta.alternates || []
  const tags = [
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    meta.noindex ? '<meta name="robots" content="noindex, follow" />' : '',
    meta.canonical ? `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />` : '',
    ...alternates.map(([l, href]) => `<link rel="alternate" hreflang="${l}" href="${escapeHtml(href)}" />`),
    alternates.length ? `<link rel="alternate" hreflang="x-default" href="${escapeHtml(alternates[0][1])}" />` : '',
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${meta.type || 'website'}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    meta.canonical ? `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />` : '',
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:locale" content="${LOCALES[meta.lang]}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    meta.jsonLd
      ? // "<" échappé : un texte saisi dans l'admin ne peut pas fermer la balise <script>
        `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': meta.jsonLd }).replace(/</g, '\\u003c')}</script>`
      : '',
  ].filter(Boolean)
  return html
    .replace(/<html lang="[^"]*"/, `<html lang="${meta.lang}"`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace('</head>', `    ${tags.join('\n    ')}\n  </head>`)
}

/* ------------------------------------------------------------------
   robots.txt et sitemap.xml
   /api/ reste ouvert : Google en a besoin pour afficher le contenu des pages React
------------------------------------------------------------------ */
export function robotsTxt(req) {
  return ['User-agent: *', 'Disallow: /admin', 'Disallow: /api/admin', '', `Sitemap: ${siteUrl(req)}/sitemap.xml`, ''].join('\n')
}

export async function sitemapXml(req) {
  const base = siteUrl(req)
  // Pages sans préfixe de langue ; chacune est ensuite listée dans les 5 langues
  const pages = Object.keys(PAGES).map((path) => ({ path }))
  // Dernière modification (AAAA-MM-JJ) : aide Google à revenir sur les pages changées
  const day = (value) => (value ? toIso(value).slice(0, 10) : undefined)

  const [circuits] = await pool.execute('SELECT slug, updated_at FROM circuits WHERE is_published = 1 ORDER BY sort_order, id')
  for (const c of circuits) pages.push({ path: `/circuits/${c.slug}`, lastmod: day(c.updated_at) })

  const [destinations] = await pool.execute('SELECT slug, details, updated_at FROM destinations WHERE is_published = 1 ORDER BY sort_order, id')
  for (const d of destinations) {
    pages.push({ path: `/destinations/${d.slug}`, lastmod: day(d.updated_at) })
    for (const place of parseJson(d.details, {}).visit || []) {
      if (place.slug) pages.push({ path: `/destinations/${d.slug}/${place.slug}`, lastmod: day(d.updated_at) })
    }
  }

  const [posts] = await pool.execute('SELECT slug, updated_at FROM blog_posts WHERE is_published = 1 ORDER BY published_on DESC, id DESC')
  for (const p of posts) pages.push({ path: `/blog/${p.slug}`, lastmod: day(p.updated_at) })

  const entries = []
  for (const { path, lastmod } of pages) {
    const links = ALL_LANGUAGES.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${escapeHtml(`${base}${localPath(path, l)}`)}"/>`)
    links.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(`${base}${path}`)}"/>`)
    for (const lang of ALL_LANGUAGES) {
      entries.push(
        `  <url><loc>${escapeHtml(`${base}${localPath(path, lang)}`)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}\n    ${links.join('\n    ')}\n  </url>`,
      )
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`
}
