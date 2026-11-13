// Applies the approved November 2026 catalogue once, including to existing installations.
// The marker and all catalogue changes commit together. Later admin edits are preserved.
import fs from 'node:fs/promises'
import { loadCircuitSeed, saveCircuit, validateCircuit } from './circuits.js'
import { saveOffer, validateOffer } from './offers.js'

const VERSION = '2026-11-13-approved-catalogue'
const OFFERS_FILE = new URL('../../sql/offers.seed.json', import.meta.url)

export async function updateCatalogue(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS catalogue_updates (
    version VARCHAR(100) PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`)

  // One connection owns both the advisory lock and the transaction.
  const [[{ acquired }]] = await db.query('SELECT GET_LOCK(?, 30) AS acquired', [VERSION])
  if (Number(acquired) !== 1) throw new Error('Could not lock the catalogue update.')

  try {
    const [applied] = await db.execute('SELECT version FROM catalogue_updates WHERE version = ?', [VERSION])
    if (applied.length) return false

    // Validate everything before modifying the current catalogue.
    const circuits = (await loadCircuitSeed()).map(validateCircuit)
    const offers = JSON.parse(await fs.readFile(OFFERS_FILE, 'utf8'))
      .filter(offer => offer.kind === 'excursion' && offer.region === 'Diego Suarez')
      .map(offer => validateOffer(offer, 'excursion'))
    if (circuits.length !== 3 || offers.length !== 8) throw new Error('Expected three circuits and eight Diego excursions.')

    await db.beginTransaction()
    try {
      await db.query('DELETE FROM circuits')
      for (const circuit of circuits) {
        await saveCircuit(db, circuit, null, { transaction: false })
      }

      await db.execute("DELETE FROM offers WHERE kind = 'excursion' AND JSON_UNQUOTE(JSON_EXTRACT(details, '$.region')) = ?", ['Diego Suarez'])
      for (const offer of offers) await saveOffer(db, offer)

      await db.query(`UPDATE offers SET price = NULL,
        details = JSON_REMOVE(details, '$.priceNote', '$.priceLabel'),
        translations = JSON_REMOVE(translations,
          '$.fr.priceNote', '$.fr.priceLabel', '$.it.priceNote', '$.it.priceLabel',
          '$.de.priceNote', '$.de.priceLabel', '$.es.priceNote', '$.es.priceLabel')`)

      await db.execute('INSERT INTO catalogue_updates (version) VALUES (?)', [VERSION])
      await db.commit()
      return true
    } catch (error) {
      await db.rollback()
      throw error
    }
  } finally {
    await db.query('SELECT RELEASE_LOCK(?)', [VERSION])
  }
}
