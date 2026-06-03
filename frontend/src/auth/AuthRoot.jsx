import { ClerkProvider } from '@clerk/clerk-react'
import { ClerkBackedAuthProvider, StaticAuthProvider } from './AuthProvider.jsx'

export default function AuthRoot({ children }) {
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  if (!clerkPublishableKey) {
    return <StaticAuthProvider>{children}</StaticAuthProvider>
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ClerkBackedAuthProvider>{children}</ClerkBackedAuthProvider>
    </ClerkProvider>
  )
}
