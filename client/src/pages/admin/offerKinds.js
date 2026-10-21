// Types d'offres gérés dans /admin/offers : mêmes champs que server/src/utils/offers.js (KINDS).
// Chaque type a, en plus du titre, du texte et de la photo communs à tous :
//   price   : prix en euros par personne
//   fields  : champs propres au type, dans l'ordre du formulaire
//     text   : texte court, traduisible          select : une valeur parmi `options` (non traduite)
//     list   : lignes de texte, traduisibles     multi  : plusieurs valeurs parmi `options`
//     months : meilleure période (12 mois)       hours  : durée en heures       link : page ouverte par la carte
//   empty   : valeurs d'une nouvelle offre de ce type

const option = (value, label = value) => ({ value, label })

export const OFFER_KINDS = {
  activity: {
    label: 'Activities',
    singular: 'activity',
    page: '/activities',
    price: true,
    fields: [
      { key: 'type', type: 'text', label: 'Type', placeholder: 'Land, Sea…' },
      { key: 'duration', type: 'text', label: 'Duration', placeholder: '3–5 h' },
      { key: 'level', type: 'text', label: 'Level', placeholder: 'Easy' },
      { key: 'group', type: 'text', label: 'Group size', placeholder: '2–8' },
      { key: 'months', type: 'months', label: 'Best time (table on the page)' },
    ],
    empty: { type: 'Land', duration: '', level: 'Easy', group: '', months: [0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0] },
  },
  excursion: {
    label: 'Excursions',
    singular: 'excursion',
    page: '/excurssions',
    price: true,
    fields: [
      { key: 'place', type: 'text', label: 'Place', placeholder: 'Ambanja' },
      { key: 'region', type: 'select', label: 'Region (filter)', options: ['North', 'Highlands', 'West', 'East'].map((r) => option(r)) },
      { key: 'length', type: 'select', label: 'Length (filter)', options: [option('half', 'Half day'), option('day', 'Full day'), option('multi', '2 days or more')] },
      { key: 'duration', type: 'text', label: 'Duration shown', placeholder: '1 day' },
      { key: 'group', type: 'text', label: 'Group size', placeholder: 'Up to 8 guests' },
      { key: 'level', type: 'text', label: 'Level', placeholder: 'Easy' },
      { key: 'link', type: 'link', label: 'Details page (optional)', hint: 'e.g. /destinations/ambanja/sambirano-valley. Empty: the contact form.' },
    ],
    empty: { place: '', region: 'North', length: 'day', duration: '', group: '', level: 'Easy', link: '' },
  },
  cruise: {
    label: 'Cruise excursions',
    singular: 'cruise excursion',
    page: '/cruise-excurssion',
    price: true,
    fields: [
      { key: 'port', type: 'select', label: 'Port', options: [option('nosybe', 'Nosy Be'), option('diego', 'Diego Suarez')] },
      { key: 'tag', type: 'select', label: 'Theme', options: ['Sea', 'Nature', 'Culture'].map((r) => option(r)) },
      { key: 'hours', type: 'hours', label: 'Total time (hours)', hint: 'Transfers to and from the pier included.' },
    ],
    empty: { port: 'nosybe', tag: 'Sea', hours: 4 },
  },
  longstay: {
    label: 'Long stays',
    singular: 'long stay',
    page: '/longstay',
    price: false,
    fields: [
      { key: 'tab', type: 'text', label: 'Tab label', placeholder: '1 month' },
      { key: 'priceLabel', type: 'text', label: 'Price shown', placeholder: 'From €1,900' },
      { key: 'points', type: 'list', label: 'Included', max: 10 },
    ],
    empty: { tab: '', priceLabel: '', points: [''] },
  },
  idea: {
    label: 'Tailor-made ideas',
    singular: 'idea',
    page: '/tailor-made',
    price: false,
    fields: [
      {
        key: 'interests',
        type: 'multi',
        label: 'Interests ticked in the form',
        options: ['Islands & beaches', 'Wildlife', 'Culture & villages', 'Hiking & adventure', 'Sailing & sea', 'Slow & relaxing'].map((r) => option(r)),
      },
      { key: 'travellers', type: 'select', label: 'Travellers chosen in the form', options: ['Solo', 'Couple', 'Family', 'Friends'].map((r) => option(r)) },
    ],
    empty: { interests: [], travellers: 'Couple' },
  },
}

export const KIND_NAMES = Object.keys(OFFER_KINDS)

// Champs à traduire dans l'onglet Traductions
export const translationFields = (kind) => ({
  textFields: [
    { key: 'title', label: 'Title', wide: true },
    { key: 'text', label: 'Description', wide: true, rows: 3 },
    ...OFFER_KINDS[kind].fields.filter((f) => f.type === 'text').map(({ key, label }) => ({ key, label })),
  ],
  listFields: OFFER_KINDS[kind].fields.filter((f) => f.type === 'list').map(({ key, label }) => ({ key, label })),
})
