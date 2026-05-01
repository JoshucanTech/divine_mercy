import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyPassword } from '@/lib/hash'

// Mock admin user for demo
const ADMIN_USER = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Administrator',
  passwordHash: '$2b$10$R0w1IeJoApZFhIMg5ZUcBe31Tr6zik2JKhxpd.n3oHnOALIqsjtJ2', // 'admin123' hashed
}

const handler = NextAuth({
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check against mock admin user
        if (credentials.email !== ADMIN_USER.email) {
          return null
        }

        const isPasswordValid = await verifyPassword(
          credentials.password,
          ADMIN_USER.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: ADMIN_USER.id,
          email: ADMIN_USER.email,
          name: ADMIN_USER.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production',
})

export { handler as GET, handler as POST }
