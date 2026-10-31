// Référencement : ce que Google et les aperçus de liens (WhatsApp, Facebook...) lisent sans lancer React.
//   - balises de chaque page (titre, description, adresse canonique, aperçu de partage, données structurées),
//     posées dans index.html avant de l'envoyer ;
//   - robots.txt et sitemap.xml.
// Les textes sont en anglais, la langue servie aux robots.
// SITE_URL (ex. https://noziwild.com) : adresse officielle du site. Vide : l'adresse de la requête.
import pool from '../config/db.js'

const SITE_NAME = 'Noziwild'
const DEFAULT_IMAGE = '/og-image.jpg'
const DEFAULT_DESCRIPTION =
  'Private tours and tailor-made trips across Madagascar, with local guides, handpicked stays and a free quote within one working day.'

// Pages fixes : adresse -> titre et description (moins de 160 caractères, coupés au-delà par Google)
const PAGES = {
  '/': {
    title: 'Noziwild | Private Tours & Tailor-Made Trips in Madagascar',
    description:
      'Local guides, handpicked stays and itineraries designed by people who live in Madagascar. Tell us your dream trip and get a free quote within one working day.',
  },
  '/circuits': {
    title: 'Madagascar Tours & Circuits | Noziwild',
    description:
      'From the northern bays to the baobabs of the west, choose a ready-made Madagascar tour with local guides, or ask us to build your own route.',
  },
  '/destinations': {
    title: 'Madagascar Destinations: Where To Go | Noziwild',
    description:
      'Nosy Iranja, Ramena, Ambanja, Antananarivo, Baobab Avenue and more: where to go in Madagascar, what to do there and the places worth visiting.',
  },
  '/excurssions': {
    title: 'Excursions & Day Trips in Madagascar | Noziwild',
    description:
      'From a morning on the water to a three-day escape around Nosy Be. Choose how long you have, we handle the boats, transfers and guides.',
  },
  '/cruise-excurssion': {
    title: 'Madagascar Shore Excursions for Cruise Passengers | Noziwild',
    description:
      'See the best of Madagascar in one port day: excursions timed around your ship, with pier transfers and a guaranteed margin before all-aboard.',
  },
  '/longstay': {
    title: 'Long Stays in Madagascar | Noziwild',
    description:
      'Stay a month or more in Madagascar. Housing, transport, connectivity and local introductions are ready before you land.',
  },
  '/tailor-made': {
    title: 'Tailor-Made Trips to Madagascar | Noziwild',
    description:
      'No fixed itinerary: tell us what you love, how long you have and who is travelling, and we design your Madagascar trip around you.',
  },
  '/travel-planning': {
    title: 'Madagascar Travel Planning | Noziwild',
    description:
      'Tell us what you love. A dedicated planner builds your Madagascar route, stays and every little detail, day by day.',
  },
  '/activities': {
    title: 'Things To Do in Madagascar: Activities | Noziwild',
    description:
      'Birdwatching at sunrise, a catamaran at sunset and jungle walks in between. Pick your favourite Madagascar activities, we organize everything.',
  },
  '/transport': {
    title: 'Transport & Transfers in Madagascar | Noziwild',
    description:
      'Getting around Madagascar by road and by sea, with comfort and safety included in every vehicle, boat and seat we book.',
  },
  '/hosting': {
    title: 'Accommodation in Madagascar: Handpicked Stays | Noziwild',
    description:
      'Hotels, lodges and beach bungalows chosen by our team across Madagascar. Tell us your dates and budget, we suggest the stays that fit.',
  },
  '/guide': {
    title: 'Local Guides in Madagascar | Noziwild',
    description:
      'A good guide turns a nice trip into a story you tell for years. Book a local expert for a day, or a Noziwild companion for your whole trip.',
  },
  '/equipment-rentals': {
    title: 'Travel Gear Rental in Madagascar | Noziwild',
    description:
      'Leave the heavy bags at home. Rent clean, checked gear for your Madagascar trip and get it delivered where you stay.',
  },
  '/photography': {
    title: 'Holiday Photographer in Madagascar | Noziwild',
    description:
      'A photographer by your side in Madagascar, so you can live the trip and still bring every moment home. Editing and private gallery included.',
  },
  '/food-dining': {
    title: 'Food & Dining in Madagascar | Noziwild',
    description:
      'Street stalls, family kitchens and fresh seafood on the beach. We take you where locals eat in Madagascar, and book the table for you.',
  },
  '/ticket-reservation': {
    title: 'Tickets & Reservations in Madagascar | Noziwild',
    description:
      'Parks, boat trips, sites and events in Madagascar, reserved for you in advance. No lines, just your e-ticket on your phone.',
  },
  '/about': {
    title: 'About Noziwild | Local Madagascar Travel Experts',
    description:
      'Noziwild designs journeys across Madagascar around the people who take them, with honest advice, fair prices and local knowledge you can trust.',
  },
  '/contact': {
    title: 'Contact Noziwild | Plan Your Madagascar Trip',
    description:
      'Questions about a trip, a custom itinerary or a partnership? Send us a message and a travel expert replies within one working day.',
  },
  '/blog': {
    title: 'Madagascar Travel Blog | Noziwild',
    description:
      'Travel stories, tips and guides from our team in Madagascar: hidden bays, wildlife, the highlands and where to stay.',
  },
}

// Pages personnelles ou techniques : jamais dans Google (le site les affiche quand même)
const PRIVATE_PAGES = ['/my-trip', '/login', '/register', '/forgot-password', '/reset-password', '/account']
const isPrivate = (pathname) => PRIVATE_PAGES.includes(pathname) || pathname === '/admin' || pathname.startsWith('/admin/')

export function siteUrl(req) {
  return (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '')
}

// /Circuits/ -> /circuits (React Router ignore les majuscules et la barre finale)
const normalize = (pathname) => (pathname.replace(/\/+$/, '') || '/').toLowerCase()

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

const pad = (n) => String(n).padStart(2, '0')
const toDay = (value) =>
  value instanceof Date ? `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}` : String(value).slice(0, 10)
const toIso = (value) => (value instanceof Date ? value.toISOString() : value ? String(value) : undefined)

/* ------------------------------------------------------------------
   Données structurées (schema.org), lues par Google pour enrichir les résultats
------------------------------------------------------------------ */
function organization(base) {
  return {
    '@type': 'TravelAgency',
    '@id': `${base}/#organization`,
    name: SITE_NAME,
    url: `${base}/`,
    logo: `${base}/favicon.svg`,
    image: `${base}${DEFAULT_IMAGE}`,
    description: DEFAULT_DESCRIPTION,
    address: { '@type': 'PostalAddress', addressLocality: 'Antananarivo', addressCountry: 'MG' },
    areaServed: { '@type': 'Country', name: 'Madagascar' },
  }
}

function breadcrumbs(base, items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${base}${path}` })),
  }
}

/* ------------------------------------------------------------------
   Pages tirées de la base : circuits, destinations, lieux, articles.
   null : l'élément n'existe pas (ou n'est pas publié) -> page 404
------------------------------------------------------------------ */
async function circuitMeta(base, slug) {
  const [[row]] = await pool.execute('SELECT * FROM circuits WHERE slug = ? AND is_published = 1', [slug])
  if (!row) return null
  const path = `/circuits/${row.slug}`
  return {
    title: `${row.title} (${row.days} Days) | Noziwild`,
    description: row.summary,
    image: row.cover_image,
    jsonLd: [
      {
        '@type': 'TouristTrip',
        name: row.title,
        description: row.summary,
        url: `${base}${path}`,
        image: absolute(base, row.cover_image),
        touristType: row.tour_type || undefined,
        offers: {
          '@type': 'Offer',
          price: row.price,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: `${base}${path}`,
        },
        provider: { '@id': `${base}/#organization` },
      },
      breadcrumbs(base, [['Home', '/'], ['Circuits', '/circuits'], [row.title, path]]),
    ],
  }
}

async function destinationRow(slug) {
  const [[row]] = await pool.execute('SELECT * FROM destinations WHERE slug = ? AND is_published = 1', [slug])
  return row || null
}

async function destinationMeta(base, slug) {
  const row = await destinationRow(slug)
  if (!row) return null
  const details = parseJson(row.details, {})
  const path = `/destinations/${row.slug}`
  const description = details.tagline ? `${details.tagline}. ${(details.intro || [])[0] || ''}` : (details.intro || [])[0]
  return {
    title: `${row.name}, Madagascar: What To See & Do | Noziwild`,
    description,
    image: row.image,
    jsonLd: [
      {
        '@type': 'TouristDestination',
        name: row.name,
        description: shorten(description, 300),
        url: `${base}${path}`,
        image: absolute(base, row.image),
        containedInPlace: { '@type': 'Country', name: 'Madagascar' },
        includesAttraction: (details.visit || []).map((place) => ({
          '@type': 'TouristAttraction',
          name: place.name,
          url: `${base}${path}/${place.slug}`,
        })),
      },
      breadcrumbs(base, [['Home', '/'], ['Destinations', '/destinations'], [row.name, path]]),
    ],
  }
}

async function placeMeta(base, slug, placeSlug) {
  const row = await destinationRow(slug)
  if (!row) return null
  const place = (parseJson(row.details, {}).visit || []).find((p) => p.slug === placeSlug)
  if (!place) return null
  const path = `/destinations/${row.slug}/${place.slug}`
  return {
    title: `${place.name}, ${row.name} | Noziwild`,
    description: place.text,
    image: place.image || row.image,
    jsonLd: [
      {
        '@type': 'TouristAttraction',
        name: place.name,
        description: place.text,
        url: `${base}${path}`,
        image: absolute(base, place.image || row.image),
        containedInPlace: { '@type': 'Place', name: `${row.name}, Madagascar` },
      },
      breadcrumbs(base, [['Home', '/'], ['Destinations', '/destinations'], [row.name, `/destinations/${row.slug}`], [place.name, path]]),
    ],
  }
}

async function postMeta(base, slug) {
  const [[row]] = await pool.execute('SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1', [slug])
  if (!row) return null
  const path = `/blog/${row.slug}`
  return {
    title: `${row.title} | Noziwild`,
    description: row.excerpt,
    image: row.image,
    type: 'article',
    jsonLd: [
      {
        '@type': 'BlogPosting',
        headline: row.title,
        description: row.excerpt,
        url: `${base}${path}`,
        mainEntityOfPage: `${base}${path}`,
        image: absolute(base, row.image),
        datePublished: toDay(row.published_on),
        dateModified: toIso(row.updated_at),
        author: { '@id': `${base}/#organization` },
        publisher: { '@id': `${base}/#organization` },
      },
      breadcrumbs(base, [['Home', '/'], ['Blog', '/blog'], [row.title, path]]),
    ],
  }
}

// Balises d'une adresse : { title, description, image, canonical, noindex, status, jsonLd }
export async function pageMeta(req) {
  const base = siteUrl(req)
  const path = normalize(req.path)
  const meta = { title: `${SITE_NAME} Madagascar`, description: DEFAULT_DESCRIPTION, image: DEFAULT_IMAGE, status: 200 }

  if (isPrivate(path)) return { ...meta, noindex: true }

  const page = PAGES[path]
  if (page) {
    const jsonLd = path === '/' ? [organization(base), { '@type': 'WebSite', name: SITE_NAME, url: `${base}/` }] : undefined
    return { ...meta, ...page, canonical: `${base}${path === '/' ? '/' : path}`, jsonLd }
  }

  const [, section, slug, placeSlug, extra] = path.split('/')
  let found
  try {
    if (section === 'circuits' && slug && !placeSlug) found = await circuitMeta(base, slug)
    else if (section === 'destinations' && slug && !placeSlug) found = await destinationMeta(base, slug)
    else if (section === 'destinations' && placeSlug && !extra) found = await placeMeta(base, slug, placeSlug)
    else if (section === 'blog' && slug && !placeSlug) found = await postMeta(base, slug)
  } catch (error) {
    // Base injoignable : balises par défaut, sans dire 404 (la page existe peut-être)
    console.error('Balises SEO non lues :', error.code || error.message)
    return { ...meta, canonical: `${base}${path}` }
  }
  // Adresse inconnue : React affiche la page, mais Google doit savoir qu'elle n'existe pas
  if (!found) return { ...meta, title: `Page not found | ${SITE_NAME}`, noindex: true, status: 404 }
  return { ...meta, ...found, description: shorten(found.description), canonical: `${base}${path}` }
}

/* ------------------------------------------------------------------
   Pose des balises dans index.html
------------------------------------------------------------------ */
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export function renderHead(html, meta, req) {
  const base = siteUrl(req)
  const image = absolute(base, meta.image || DEFAULT_IMAGE)
  const tags = [
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    meta.noindex ? '<meta name="robots" content="noindex, follow" />' : '',
    meta.canonical ? `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />` : '',
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${meta.type || 'website'}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    meta.canonical ? `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />` : '',
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    '<meta property="og:locale" content="en_US" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    meta.jsonLd
      ? // "<" échappé : un texte saisi dans l'admin ne peut pas fermer la balise <script>
        `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': meta.jsonLd }).replace(/</g, '\\u003c')}</script>`
      : '',
  ].filter(Boolean)
  return html
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
  const urls = Object.keys(PAGES).map((path) => ({ loc: `${base}${path}` }))
  // Dernière modification (AAAA-MM-JJ) : aide Google à revenir sur les pages changées
  const day = (value) => (value ? toIso(value).slice(0, 10) : undefined)

  const [circuits] = await pool.execute('SELECT slug, updated_at FROM circuits WHERE is_published = 1 ORDER BY sort_order, id')
  for (const c of circuits) urls.push({ loc: `${base}/circuits/${c.slug}`, lastmod: day(c.updated_at) })

  const [destinations] = await pool.execute('SELECT slug, details, updated_at FROM destinations WHERE is_published = 1 ORDER BY sort_order, id')
  for (const d of destinations) {
    urls.push({ loc: `${base}/destinations/${d.slug}`, lastmod: day(d.updated_at) })
    for (const place of parseJson(d.details, {}).visit || []) {
      if (place.slug) urls.push({ loc: `${base}/destinations/${d.slug}/${place.slug}`, lastmod: day(d.updated_at) })
    }
  }

  const [posts] = await pool.execute('SELECT slug, updated_at FROM blog_posts WHERE is_published = 1 ORDER BY published_on DESC, id DESC')
  for (const p of posts) urls.push({ loc: `${base}/blog/${p.slug}`, lastmod: day(p.updated_at) })

  const entries = urls.map(
    ({ loc, lastmod }) => `  <url><loc>${escapeHtml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
}
