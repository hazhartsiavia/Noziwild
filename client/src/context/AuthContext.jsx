// Partage l'utilisateur connecté avec toute l'application.
// Utilisation dans un composant :  const { user, login, logout } = useAuth()
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMe, loginUser, registerUser, loginWithGoogle, logoutUser } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // true tant qu'on ne sait pas encore si quelqu'un est connecté
  const [loading, setLoading] = useState(true)

  // Au chargement du site : la session (cookie) est-elle encore valide ?
  useEffect(() => {
    fetchMe()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { user } = await loginUser({ email, password })
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const { user } = await registerUser({ name, email, password })
    setUser(user)
    return user
  }, [])

  const googleLogin = useCallback(async (credential) => {
    const { user } = await loginWithGoogle(credential)
    setUser(user)
    return user
  }, [])

  // Après une action sur la page Compte, le serveur renvoie l'utilisateur à jour
  const updateUser = useCallback((nextUser) => setUser(nextUser), [])

  const logout = useCallback(async () => {
    await logoutUser().catch(() => {})
    // Empêche Google de reconnecter automatiquement juste après la déconnexion
    window.google?.accounts?.id?.disableAutoSelect()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, googleLogin, updateUser, logout }),
    [user, loading, login, register, googleLogin, updateUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return context
}
