// Photos de l'admin :
//   GET  /api/admin/uploads  → bibliothèque (photos de départ + photos envoyées)
//   POST /api/admin/uploads  → envoi d'une photo (formulaire multipart, champ "image"),
//                              rangée dans UPLOADS_FILES_DIR (servie sur /uploads/files/) ; le chemin renvoyé s'utilise ensuite dans un circuit
//   POST /api/admin/uploads/video → envoi d'une vidéo de fond (champ "video"), rangée au même endroit
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import multer from 'multer'
import { UPLOADS_DIR, UPLOADS_FILES_DIR } from '../config/paths.js'

const MAX_SIZE = 8 * 1024 * 1024
const IMAGE_FILE = /\.(png|jpe?g|webp)$/i
const MAX_VIDEO_SIZE = 60 * 1024 * 1024
const VIDEO_FILE = /\.(mp4|webm)$/i

// Dossiers montrés dans la bibliothèque, les envois récents d'abord
const LIBRARY = [
  { folder: 'files', dir: UPLOADS_FILES_DIR },
  { folder: 'circuits', dir: path.join(UPLOADS_DIR, 'circuits') },
]

export async function listUploads(req, res) {
  const photos = []
  for (const { folder, dir } of LIBRARY) {
    const names = await fs.readdir(dir).catch(() => [])
    const entries = await Promise.all(
      names.filter((name) => IMAGE_FILE.test(name)).map(async (name) => {
        const stat = await fs.stat(path.join(dir, name))
        return { path: `/uploads/${folder}/${name}`, folder, size: stat.size, modifiedAt: stat.mtime }
      }),
    )
    photos.push(...entries.sort((a, b) => b.modifiedAt - a.modifiedAt))
  }
  const names = await fs.readdir(UPLOADS_FILES_DIR).catch(() => [])
  const videos = await Promise.all(
    names.filter((name) => VIDEO_FILE.test(name)).map(async (name) => {
      const stat = await fs.stat(path.join(UPLOADS_FILES_DIR, name))
      return { path: `/uploads/files/${name}`, size: stat.size, modifiedAt: stat.mtime }
    }),
  )
  videos.sort((a, b) => b.modifiedAt - a.modifiedAt)
  res.json({ ok: true, photos, videos })
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
      await fs.mkdir(UPLOADS_FILES_DIR, { recursive: true })
      await fs.writeFile(path.join(UPLOADS_FILES_DIR, name), req.file.buffer)

      res.status(201).json({ ok: true, path: `/uploads/files/${name}` })
    } catch (err) {
      next(err)
    }
  })
}

// Mêmes précautions que les photos : on regarde le début du fichier. Le format .mov (brand "qt") ne se lit pas partout.
function detectVideo(buffer) {
  if (buffer.toString('ascii', 4, 8) === 'ftyp' && buffer.toString('ascii', 8, 10) !== 'qt') return 'mp4'
  if (buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return 'webm'
  return null
}

// Une vidéo est trop lourde pour rester en mémoire : elle arrive dans un fichier temporaire, renommé une fois vérifiée
const receiveVideo = multer({
  storage: multer.diskStorage({
    destination: (req, file, done) => fs.mkdir(UPLOADS_FILES_DIR, { recursive: true }).then(() => done(null, UPLOADS_FILES_DIR), done),
    filename: (req, file, done) => done(null, `.upload-${crypto.randomBytes(8).toString('hex')}`),
  }),
  limits: { fileSize: MAX_VIDEO_SIZE, files: 1 },
}).single('video')

export function uploadVideo(req, res, next) {
  receiveVideo(req, res, async (error) => {
    const temporary = req.file?.path
    try {
      if (error) {
        const tooBig = error.code === 'LIMIT_FILE_SIZE'
        return res.status(tooBig ? 413 : 400).json({ ok: false, error: tooBig ? 'The video must be 60 MB or less.' : error.message })
      }
      if (!temporary) return res.status(400).json({ ok: false, error: 'Send the video in a field named "video".' })

      const file = await fs.open(temporary)
      const { buffer } = await file.read(Buffer.alloc(16), 0, 16, 0)
      await file.close()
      const extension = detectVideo(buffer)
      if (!extension) {
        await fs.unlink(temporary)
        return res.status(400).json({ ok: false, error: 'Only MP4 and WebM videos are accepted.' })
      }

      const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`
      await fs.rename(temporary, path.join(UPLOADS_FILES_DIR, name))
      res.status(201).json({ ok: true, path: `/uploads/files/${name}` })
    } catch (err) {
      if (temporary) await fs.unlink(temporary).catch(() => {})
      next(err)
    }
  })
}
