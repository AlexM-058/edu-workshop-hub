import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

export function useAppAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAppAuth must be used inside an auth provider')
  }

  return context
}
