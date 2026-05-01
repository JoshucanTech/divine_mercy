import { defineConfig } from '@prisma/internals'

export const config = defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})
