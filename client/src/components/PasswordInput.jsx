// Champ mot de passe avec un bouton pour afficher / masquer ce qui est tapé
import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FIELD } from './authStyles'
import { useT } from '../i18n/LanguageContext'

function PasswordInput(props) {
  const t = useT('auth')
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={`${FIELD} pr-14`} />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? t('hide') : t('show')}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:text-slate-800 transition"
      >
        {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
      </button>
    </div>
  )
}

export default PasswordInput
