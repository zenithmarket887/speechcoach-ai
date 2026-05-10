import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Identifiants',
      credentials: {
        login: { label: 'Email ou code patient', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null

        const { data: user, error } = await supabase
          .from('users')
          .select('id, login, name, password_hash, role, plan')
          .eq('login', credentials.login.trim().toLowerCase())
          .single()

        if (error || !user) return null

        const valid = await bcrypt.compare(credentials.password, user.password_hash)
        if (!valid) return null

        return {
          id: user.login,
          name: user.name,
          email: user.login,
          role: user.role as 'orthophoniste' | 'patient',
          plan: (user.plan ?? 'free') as 'free' | 'monthly' | 'annual',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.plan = user.plan
      }
      // Refresh plan when session is updated (after a successful checkout)
      if (trigger === 'update' && token.id) {
        const { data } = await supabase.from('users').select('plan').eq('login', token.id).single()
        if (data?.plan) token.plan = data.plan as 'free' | 'monthly' | 'annual'
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: session.user?.name ?? '',
        role: token.role,
        plan: token.plan ?? 'free',
      }
      return session
    },
  },
  pages: { signIn: '/login' },
}
