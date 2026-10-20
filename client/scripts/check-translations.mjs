// Vérifie que chaque langue a les mêmes textes que l'anglais : npm run i18n:check
// (clés manquantes ou en trop, listes de longueur différente, {variables} oubliées)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n', 'locales')
const languages = fs.readdirSync(dir).filter((name) => name !== 'en')
const read = (lang, file) => JSON.parse(fs.readFileSync(path.join(dir, lang, file), 'utf8'))
const vars = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')

const problems = []
function compare(en, other, where) {
  if (typeof en === 'string') {
    if (typeof other !== 'string') problems.push(`${where} : texte manquant`)
    else if (vars(en) !== vars(other)) problems.push(`${where} : variables {${vars(en)}} attendues`)
    return
  }
  if (Array.isArray(en)) {
    if (!Array.isArray(other)) return problems.push(`${where} : liste manquante`)
    if (other.length !== en.length) problems.push(`${where} : ${other.length} éléments au lieu de ${en.length}`)
    en.forEach((item, i) => compare(item, other[i], `${where}[${i}]`))
    return
  }
  if (en && typeof en === 'object') {
    if (!other || typeof other !== 'object') return problems.push(`${where} : bloc manquant`)
    for (const key of Object.keys(en)) compare(en[key], other[key], `${where}.${key}`)
    for (const key of Object.keys(other)) if (!(key in en)) problems.push(`${where}.${key} : en trop`)
  }
}

for (const file of fs.readdirSync(path.join(dir, 'en'))) {
  const en = read('en', file)
  for (const lang of languages) {
    if (!fs.existsSync(path.join(dir, lang, file))) problems.push(`${lang}/${file} : fichier manquant`)
    else compare(en, read(lang, file), `${lang}/${file.replace('.json', '')}`)
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`Traductions complètes (${languages.join(', ')}).`)
