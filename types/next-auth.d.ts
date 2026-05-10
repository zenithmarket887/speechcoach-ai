import 'next-auth'

export type Plan = 'free' | 'monthly' | 'annual'

declare module 'next-auth' {
  interface User {
    role: 'orthophoniste' | 'patient'
    plan: Plan
  }
  interface Session {
    user: {
      id: string
      name: string
      role: 'orthophoniste' | 'patient'
      plan: Plan
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'orthophoniste' | 'patient'
    id: string
    plan: Plan
  }
}
