// Enregistre dans MySQL les formulaires envoyés par le site.
// Les "?" dans les requêtes SQL protègent contre les injections SQL.
import pool from '../config/db.js'
import { clean, check, ValidationError } from '../utils/validate.js'

// Si le visiteur est connecté, la demande est rattachée à son compte (visible sur sa page Compte)
const userId = (req) => req.user?.id ?? null

// POST /api/contact  (page Contact)
export async function createContact(req, res) {
  const name = clean(req.body.name, 120)
  const email = clean(req.body.email, 190)
  const phone = clean(req.body.phone, 40)
  const inquiryType = clean(req.body.inquiry, 60)
  const message = clean(req.body.message, 5000)

  check({ required: { name, email, message }, email })

  const [result] = await pool.execute(
    `INSERT INTO contact_messages (user_id, name, email, phone, inquiry_type, message)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId(req), name, email, phone, inquiryType, message],
  )
  res.status(201).json({ ok: true, id: result.insertId })
}

// POST /api/tailor-made  (page Tailor Made)
export async function createTailorMade(req, res) {
  const name = clean(req.body.name, 120)
  const email = clean(req.body.email, 190)
  const phone = clean(req.body.phone, 40)
  const interests = Array.isArray(req.body.interests)
    ? req.body.interests.map((i) => clean(i, 60)).filter(Boolean).join(', ')
    : clean(req.body.interests, 500)
  const length = clean(req.body.length, 60)
  const month = clean(req.body.month, 30)
  const pace = clean(req.body.pace, 60)
  const comfort = clean(req.body.comfort, 60)
  const group = clean(req.body.group, 60)
  const notes = clean(req.body.notes, 5000)

  check({ required: { name, email }, email })

  const [result] = await pool.execute(
    `INSERT INTO tailor_made_requests
       (user_id, name, email, phone, interests, trip_length, travel_month, pace, comfort, travel_group, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId(req), name, email, phone, interests || null, length, month, pace, comfort, group, notes],
  )
  res.status(201).json({ ok: true, id: result.insertId })
}

// POST /api/requests  (PlaceDetail, EquipmentRentals, FoodDining, Travelplanning, CircuitDetail)
// Corps attendu : { type: 'place' | 'gear' | 'food' | 'trip' | 'circuit', email, name?, subject?, message? }
const REQUEST_TYPES = ['place', 'gear', 'food', 'trip', 'circuit']

export async function createQuickRequest(req, res) {
  const type = clean(req.body.type, 10)
  const email = clean(req.body.email, 190)
  const name = clean(req.body.name, 120)
  const subject = clean(req.body.subject, 190)
  const message = clean(req.body.message, 5000)

  check({ required: { type, email }, email })
  if (!REQUEST_TYPES.includes(type)) {
    throw new ValidationError({ type: `Allowed values: ${REQUEST_TYPES.join(', ')}.` })
  }
  // Ces types n'ont de sens qu'avec un message
  if (['place', 'gear', 'trip', 'circuit'].includes(type)) {
    check({ required: { message } })
  }

  const [result] = await pool.execute(
    `INSERT INTO quick_requests (user_id, type, email, name, subject, message)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId(req), type, email, name, subject, message],
  )
  res.status(201).json({ ok: true, id: result.insertId })
}

// POST /api/newsletter  (page Guides)
export async function subscribeNewsletter(req, res) {
  const email = clean(req.body.email, 190)?.toLowerCase()
  check({ required: { email }, email })

  // INSERT IGNORE : si l'email existe déjà, pas d'erreur
  await pool.execute('INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)', [email])
  res.status(201).json({ ok: true })
}
