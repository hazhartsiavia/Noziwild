// Vérifie le jeton d'identité ("credential") renvoyé par le bouton Google côté React
import { OAuth2Client } from 'google-auth-library'

const googleClient = new OAuth2Client()

export class GoogleAuthError extends Error {
  constructor(message, status = 401) {
    super(message)
    this.status = status
  }
}

// Renvoie { googleId, email, name, avatar } ou lève une GoogleAuthError
export async function verifyGoogleCredential(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) throw new GoogleAuthError('Google sign-in is not configured yet.', 503)
  if (typeof credential !== 'string' || !credential) throw new GoogleAuthError('Missing Google credential.', 400)

  // Vérifie la signature Google, l'expiration et que le jeton est bien destiné à NOTRE application
  let payload
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId })
    payload = ticket.getPayload()
  } catch {
    throw new GoogleAuthError('Google sign-in failed. Please try again.')
  }

  if (!payload?.email || !payload.email_verified) {
    throw new GoogleAuthError('Your Google email address is not verified.')
  }

  const email = payload.email.toLowerCase()
  return {
    googleId: payload.sub,
    email,
    name: payload.name?.trim().slice(0, 120) || email.split('@')[0],
    avatar: payload.picture?.slice(0, 500) || null,
  }
}
