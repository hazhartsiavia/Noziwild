// Bouton officiel "Continuer avec Google" (Google Identity Services).
// Google renvoie un jeton d'identité ("credential"), que le serveur vérifie avant de connecter l'utilisateur.
// L'identifiant client Google est lu depuis le serveur (GOOGLE_CLIENT_ID dans server/.env).
import React, { useEffect, useRef, useState } from 'react'
import { fetchAuthConfig } from '../api'

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
let scriptPromise = null

// Charge le script Google une seule fois pour tout le site
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = resolve
      script.onerror = () => {
        scriptPromise = null
        reject(new Error('Impossible de charger Google.'))
      }
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

function GoogleButton({ onCredential, text = 'continue_with' }) {
  const containerRef = useRef(null)
  const callbackRef = useRef(onCredential)
  const [state, setState] = useState('loading') // 'loading' | 'ready' | 'disabled' | 'error'

  // Toujours appeler la dernière version de onCredential
  useEffect(() => {
    callbackRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    let cancelled = false

    async function setup() {
      try {
        const { googleClientId } = await fetchAuthConfig()
        if (!googleClientId) {
          if (!cancelled) setState('disabled')
          return
        }
        await loadGoogleScript()
        if (cancelled || !containerRef.current) return

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => callbackRef.current?.(response.credential),
          ux_mode: 'popup',
        })

        const width = Math.min(Math.max(containerRef.current.offsetWidth, 200), 400)
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text,
          width,
          locale: 'en',
        })
        setState('ready')
      } catch {
        if (!cancelled) setState('error')
      }
    }

    setup()
    return () => {
      cancelled = true
    }
  }, [text])

  return (
    <div className="w-full">
      <div ref={containerRef} className={`flex w-full justify-center ${state === 'disabled' ? '' : 'min-h-[44px]'}`} />
      {state === 'disabled' && (
        <p className="text-center text-xs text-slate-500">
          Google sign-in is not configured yet.
        </p>
      )}
      {state === 'error' && (
        <p className="text-center text-xs text-red-700">Google sign-in could not be loaded.</p>
      )}
    </div>
  )
}

export default GoogleButton
