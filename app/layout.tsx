import type { Metadata } from 'next'
import { Atkinson_Hyperlegible, JetBrains_Mono, Fraunces } from 'next/font/google'
import './globals.css'
import Providers from './providers'

// Police principale — conçue pour la lisibilité maximale (Braille Institute)
const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
  display: 'swap',
})

// Police technique — valeurs numériques, badges, labels
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})

// Police éditoriale — titres et voix de marque
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Parole + AI',
  description: "Outil d'entraînement à l'élocution propulsé par l'IA",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${atkinson.variable} ${jetbrainsMono.variable} ${fraunces.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
