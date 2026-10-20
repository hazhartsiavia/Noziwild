// Formats de nombres et de dates selon la langue du site
export const LOCALES = { en: 'en-US', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', es: 'es-ES' }

// 1240 -> "€1,240" (en), "1 240 €" (fr), "1.240 €" (de)...
export const formatPrice = (value, lang = 'en') =>
  new Intl.NumberFormat(LOCALES[lang] || 'en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value))
