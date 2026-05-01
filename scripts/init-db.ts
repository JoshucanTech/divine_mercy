import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/hash'

async function initializeDatabase() {
  console.log('Initializing database...')

  // Create singleton settings if not exists
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 'singleton' },
    })

    if (!settings) {
      await prisma.settings.create({
        data: {
          id: 'singleton',
          voteCost: 100,
          currency: 'NGN',
          votingActive: true,
        },
      })
      console.log('✓ Settings initialized')
    }
  } catch (error) {
    console.error('Error initializing settings:', error)
  }

  // Create default admin user if none exists
  try {
    const adminCount = await prisma.adminUser.count()

    if (adminCount === 0) {
      const hashedPassword = await hashPassword('admin123')
      await prisma.adminUser.create({
        data: {
          email: 'admin@example.com',
          passwordHash: hashedPassword,
          name: 'Administrator',
        },
      })
      console.log('✓ Default admin user created')
      console.log('  Email: admin@example.com')
      console.log('  Password: admin123')
      console.log('  ⚠️  Change this password immediately in production!')
    }
  } catch (error) {
    console.error('Error creating admin user:', error)
  }

  console.log('Database initialization complete!')
}

initializeDatabase()
  .catch((error) => {
    console.error('Database initialization failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
