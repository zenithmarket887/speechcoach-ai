'use client'
import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  // refetchInterval=0 + refetchOnWindowFocus=false : tant que l'auth est désactivée,
  // on évite les CLIENT_FETCH_ERROR en boucle dans la console.
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  )
}
