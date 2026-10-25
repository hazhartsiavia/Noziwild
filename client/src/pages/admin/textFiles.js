// Fichiers de textes du site (client/src/i18n/locales/<langue>/<fichier>.json) tels qu'ils apparaissent
// dans /admin/texts : nom lisible, page où les voir, et rangée (pages du site, éléments communs, compte).
// Un fichier absent d'ici s'affiche quand même, sous son nom technique.
export const TEXT_FILES = {
  home: { label: 'Home', page: '/', group: 'pages' },
  about: { label: 'About', page: '/about', group: 'pages' },
  contact: { label: 'Contact', page: '/contact', group: 'pages' },
  destinations: { label: 'Destinations and places', page: '/destinations', group: 'pages' },
  circuits: { label: 'Circuits (list)', page: '/circuits', group: 'pages' },
  circuitDetail: { label: 'Circuit page', page: '/circuits', group: 'pages' },
  activities: { label: 'Activities', page: '/activities', group: 'pages' },
  excursions: { label: 'Excursions', page: '/excurssions', group: 'pages' },
  cruise: { label: 'Cruise excursions', page: '/cruise-excurssion', group: 'pages' },
  longstay: { label: 'Long stays', page: '/longstay', group: 'pages' },
  tailormade: { label: 'Tailor-made', page: '/tailor-made', group: 'pages' },
  accommodation: { label: 'Accommodation', page: '/hosting', group: 'pages' },
  transport: { label: 'Transport', page: '/transport', group: 'pages' },
  guides: { label: 'Guides', page: '/guide', group: 'pages' },
  food: { label: 'Food & dining', page: '/Food-dining', group: 'pages' },
  photography: { label: 'Photography', page: '/photography', group: 'pages' },
  equipment: { label: 'Equipment rentals', page: '/equipment-rentals', group: 'pages' },
  tickets: { label: 'Tickets & reservations', page: '/ticket-reservation', group: 'pages' },
  planning: { label: 'Travel planning', page: '/travel-planning', group: 'pages' },
  blog: { label: 'Blog', page: '/blog', group: 'pages' },
  nav: { label: 'Navigation bar', page: '/', group: 'shared' },
  footer: { label: 'Footer', page: '/', group: 'shared' },
  offers: { label: 'Offer lists (loading, errors)', page: '/activities', group: 'shared' },
  trip: { label: 'My trip', page: '/my-trip', group: 'account' },
  auth: { label: 'Sign in and sign up', page: '/login', group: 'account' },
  account: { label: 'Account', page: '/account', group: 'account' },
}

export const TEXT_GROUPS = [
  { id: 'pages', label: 'Pages' },
  { id: 'shared', label: 'On every page' },
  { id: 'account', label: 'Trip and account' },
]

export const textFile = (namespace) => TEXT_FILES[namespace] || { label: namespace, page: '/', group: 'pages' }

export const TEXT_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
]
