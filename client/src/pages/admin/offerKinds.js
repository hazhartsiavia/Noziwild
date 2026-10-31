// Types d'offres gérés dans /admin/offers : mêmes champs que server/src/utils/offers.js (KINDS).
// Chaque type a, en plus du titre, du texte et de la photo communs à tous :
//   group   : rangée d'onglets dans l'admin (offres de voyage ou catalogues de services)
//   price   : prix en euros (priceLabel : libellé du champ, par personne par défaut)
//   titleLabel / textLabel : libellés du titre et du texte quand ce n'est pas « Title » / « Description »
//   textOptional / imageOptional : la description ou la photo peut rester vide
//   fields  : champs propres au type, dans l'ordre du formulaire
//     text   : texte court, traduisible          select : une valeur parmi `options` (non traduite)
//     list   : lignes de texte, traduisibles     multi  : plusieurs valeurs parmi `options`
//     months : meilleure période (12 mois)       hours  : durée en heures       link : page ouverte par la carte
//     number : nombre entre min et max, par pas de step
//   empty   : valeurs d'une nouvelle offre de ce type

const option = (value, label = value) => ({ value, label })

export const OFFER_KINDS = {
  activity: {
    group: 'trips',
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
    group: 'trips',
    label: 'Excursions',
    singular: 'excursion',
    page: '/excursions',
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
    group: 'trips',
    label: 'Cruise excursions',
    singular: 'cruise excursion',
    page: '/cruise-excursions',
    price: true,
    fields: [
      { key: 'port', type: 'select', label: 'Port', options: [option('nosybe', 'Nosy Be'), option('diego', 'Diego Suarez')] },
      { key: 'tag', type: 'select', label: 'Theme', options: ['Sea', 'Nature', 'Culture'].map((r) => option(r)) },
      { key: 'hours', type: 'hours', label: 'Total time (hours)', hint: 'Transfers to and from the pier included.' },
    ],
    empty: { port: 'nosybe', tag: 'Sea', hours: 4 },
  },
  longstay: {
    group: 'trips',
    label: 'Long stays',
    singular: 'long stay',
    page: '/long-stay',
    price: false,
    fields: [
      { key: 'tab', type: 'text', label: 'Tab label', placeholder: '1 month' },
      { key: 'priceLabel', type: 'text', label: 'Price shown', placeholder: 'From €1,900' },
      { key: 'points', type: 'list', label: 'Included', max: 10 },
    ],
    empty: { tab: '', priceLabel: '', points: [''] },
  },
  idea: {
    group: 'trips',
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
  stay: {
    group: 'services',
    label: 'Accommodation',
    singular: 'stay',
    page: '/accommodation',
    price: true,
    priceLabel: 'Price from (€ per room, per night)',
    titleLabel: 'Name',
    textOptional: true,
    fields: [
      { key: 'place', type: 'text', label: 'Place', placeholder: 'Ramena, Diego Suarez' },
      { key: 'category', type: 'select', label: 'Type (filter)', options: [option('hotel', 'Hotel'), option('lodge', 'Eco lodge'), option('bungalow', 'Beach bungalow'), option('guesthouse', 'Guesthouse')] },
      { key: 'rating', type: 'number', label: 'Guest rating (out of 5)', min: 0, max: 5, step: 0.1 },
      { key: 'amenities', type: 'list', label: 'Amenities', max: 8 },
    ],
    empty: { place: '', category: 'hotel', rating: 4.5, amenities: [''] },
  },
  transport: {
    group: 'services',
    label: 'Transport',
    singular: 'transport',
    page: '/transport',
    price: false,
    titleLabel: 'Name',
    fields: [
      { key: 'category', type: 'select', label: 'Type (filter)', options: [option('land', 'Land'), option('air', 'Air'), option('sea', 'Sea')] },
      { key: 'capacity', type: 'text', label: 'Capacity', placeholder: '1–6 travelers' },
      { key: 'duration', type: 'text', label: 'Duration', placeholder: 'Flexible' },
      { key: 'perks', type: 'list', label: 'Included', max: 6 },
    ],
    empty: { category: 'land', capacity: '', duration: '', perks: [''] },
  },
  guide: {
    group: 'services',
    label: 'Guides',
    singular: 'guide',
    page: '/guides',
    price: false,
    titleLabel: 'Name',
    textLabel: 'Short bio',
    fields: [
      { key: 'role', type: 'text', label: 'Role', placeholder: 'Wildlife Guide' },
      { key: 'langs', type: 'text', label: 'Languages', placeholder: 'English · French · Malagasy' },
      { key: 'years', type: 'number', label: 'Years of experience', min: 0, max: 80, step: 1 },
      { key: 'specialties', type: 'list', label: 'Specialties', max: 6 },
    ],
    empty: { role: '', langs: '', years: 5, specialties: [''] },
  },
  food: {
    group: 'services',
    label: 'Food experiences',
    singular: 'food experience',
    page: '/food-dining',
    price: true,
    titleLabel: 'Name',
    fields: [
      { key: 'category', type: 'select', label: 'Type (filter)', options: [option('tour', 'Tour'), option('class', 'Class'), option('meal', 'Meal')] },
      { key: 'duration', type: 'text', label: 'Duration', placeholder: '3 hours' },
    ],
    empty: { category: 'tour', duration: '' },
  },
  session: {
    group: 'services',
    label: 'Photo sessions',
    singular: 'photo session',
    page: '/photography',
    price: true,
    priceLabel: 'Price (€ per session)',
    titleLabel: 'Name',
    imageOptional: true,
    fields: [
      { key: 'duration', type: 'text', label: 'Duration', placeholder: '2 hours' },
      { key: 'photos', type: 'text', label: 'Photos delivered', placeholder: '40 edited photos' },
      { key: 'delivery', type: 'text', label: 'Delivery time', placeholder: '3 days' },
    ],
    empty: { duration: '', photos: '', delivery: '' },
  },
  photo: {
    group: 'services',
    label: 'Photo gallery',
    singular: 'gallery photo',
    page: '/photography',
    price: false,
    titleLabel: 'Caption',
    textOptional: true,
    fields: [
      { key: 'category', type: 'select', label: 'Theme (filter)', options: [option('landscape', 'Landscapes'), option('people', 'People'), option('sea', 'Sea'), option('wildlife', 'Wildlife')] },
      { key: 'ratio', type: 'select', label: 'Shape in the gallery', options: [option('landscape', 'Landscape (4:3)'), option('portrait', 'Portrait (3:4)'), option('tall', 'Tall (4:5)'), option('square', 'Square')] },
    ],
    empty: { category: 'landscape', ratio: 'landscape' },
  },
  gear: {
    group: 'services',
    label: 'Equipment',
    singular: 'item',
    page: '/equipment-rentals',
    price: true,
    priceLabel: 'Price (€ per day)',
    titleLabel: 'Name',
    fields: [
      { key: 'category', type: 'select', label: 'Type (filter)', options: [option('water', 'Water'), option('trek', 'Trek & camp'), option('ride', 'Ride'), option('optics', 'Photo & optics')] },
      { key: 'specs', type: 'list', label: 'Specs', max: 6 },
    ],
    empty: { category: 'water', specs: [''] },
  },
  ticket: {
    group: 'services',
    label: 'Tickets',
    singular: 'ticket',
    page: '/ticket-reservation',
    price: true,
    titleLabel: 'Name',
    textOptional: true,
    fields: [
      { key: 'place', type: 'text', label: 'Place', placeholder: 'Nosy Be' },
      { key: 'category', type: 'select', label: 'Type (filter)', options: [option('parks', 'Parks & reserves'), option('sea', 'Sea & boats'), option('sites', 'Sites & museums'), option('events', 'Events & shows')] },
      { key: 'perks', type: 'list', label: 'Included', max: 6 },
    ],
    empty: { place: '', category: 'parks', perks: [''] },
  },
}

// Rangées d'onglets de l'admin
export const KIND_GROUPS = [
  { id: 'trips', label: 'Trips' },
  { id: 'services', label: 'Services' },
]

export const KIND_NAMES = Object.keys(OFFER_KINDS)

// Champs à traduire dans l'onglet Traductions
export const translationFields = (kind) => ({
  textFields: [
    { key: 'title', label: OFFER_KINDS[kind].titleLabel || 'Title', wide: true },
    { key: 'text', label: OFFER_KINDS[kind].textLabel || 'Description', wide: true, rows: 3 },
    ...OFFER_KINDS[kind].fields.filter((f) => f.type === 'text').map(({ key, label }) => ({ key, label })),
  ],
  listFields: OFFER_KINDS[kind].fields.filter((f) => f.type === 'list').map(({ key, label }) => ({ key, label })),
})
