// Photos de l'admin :
//   GET  /api/admin/uploads  → bibliothèque (photos de départ + photos envoyées)
//   POST /api/admin/uploads  → envoi d'une photo (formulaire multipart, champ "image"),
//                              rangée dans uploads/files/ ; le chemin renvoyé s'utilise ensuite dans un circuit
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import multer from 'multer'
import { UPLOADS_DIR } from '../config/paths.js'

const MAX_SIZE = 8 * 1024 * 1024
const IMAGE_FILE = /\.(png|jpe?g|webp)$/i

// Dossiers montrés dans la bibliothèque, les envois récents d'abord
const LIBRARY = ['files', 'circuits']

export async function listUploads(req, res) {
  const photos = []
  for (const folder of LIBRARY) {
    const dir = path.join(UPLOADS_DIR, folder)
    const names = await fs.readdir(dir).catch(() => [])
    const entries = await Promise.all(
      names.filter((name) => IMAGE_FILE.test(name)).map(async (name) => {
        const stat = await fs.stat(path.join(dir, name))
        return { path: `/uploads/${folder}/${name}`, folder, size: stat.size, modifiedAt: stat.mtime }
      }),
    )
    photos.push(...entries.sort((a, b) => b.modifiedAt - a.modifiedAt))
  }
  res.json({ ok: true, photos })
}

// On se fie au contenu du fichier (ses premiers octets), pas au nom ni au type annoncé par le navigateur
function detectImage(buffer) {
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg'
  if (buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  return null
}

const receive = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
}).single('image')

export function uploadImage(req, res, next) {
  receive(req, res, async (error) => {
    try {
      if (error) {
        const tooBig = error.code === 'LIMIT_FILE_SIZE'
        return res.status(tooBig ? 413 : 400).json({ ok: false, error: tooBig ? 'The image must be 8 MB or less.' : error.message })
      }
      if (!req.file) return res.status(400).json({ ok: false, error: 'Send the image in a field named "image".' })

      const extension = detectImage(req.file.buffer)
      if (!extension) return res.status(400).json({ ok: false, error: 'Only JPEG, PNG and WebP images are accepted.' })

      // Nom aléatoire : pas de collision, et rien de ce que l'utilisateur a tapé ne finit dans le chemin
      const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`
      const folder = path.join(UPLOADS_DIR, 'files')
      await fs.mkdir(folder, { recursive: true })
      await fs.writeFile(path.join(folder, name), req.file.buffer)

      res.status(201).json({ ok: true, path: `/uploads/files/${name}` })
    } catch (err) {
      next(err)
    }
  })
}
