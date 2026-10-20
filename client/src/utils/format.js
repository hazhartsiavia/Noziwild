// Formats de nombres et de dates selon la langue du site
export const LOCALES = { en: 'en-US', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', es: 'es-ES' }

// 1240 -> "€1,240" (en), "1 240 €" (fr), "1.240 €" (de)...
export const formatPrice = (value, lang = 'en') =>
  new Intl.NumberFormat(LOCALES[lang] || 'en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value))

// Nom du mois (1 = janvier) dans la langue du site : monthName(4, 'fr') -> "avr."
export const monthName = (month, lang = 'en', style = 'short') =>
  new Intl.DateTimeFormat(LOCALES[lang] || 'en-US', { month: style }).format(new Date(2000, month - 1, 1))

// Date dans la langue du site : formatDate('2025-11-20', 'fr') -> "20 novembre 2025"
export const formatDate = (iso, lang = 'en', options = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Intl.DateTimeFormat(LOCALES[lang] || 'en-US', options).format(new Date(`${iso}T12:00:00`))
