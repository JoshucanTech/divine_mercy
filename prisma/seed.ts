import { mockDb } from '@/lib/mock-db'

async function main() {
  console.log('🌱 Starting mock database seed...')

  // Initialize sample contestants
  const sampleContestants = [
    {
      name: 'Alice Johnson',
      description: 'Talented singer and performer',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    },
    {
      name: 'Bob Smith',
      description: 'Professional dancer',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
    {
      name: 'Carol White',
      description: 'Award-winning musician',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    },
    {
      name: 'David Brown',
      description: 'Rising vocal talent',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    },
    {
      name: 'Emma Davis',
      description: 'Multi-talented artist',
      imageUrl: 'https://images.unsplash.com/photo-1507375341519-d6575cb41cbb?w=400&h=400&fit=crop',
    },
  ]

  // Add contestants to mock database
  sampleContestants.forEach((contestant) => {
    mockDb.createContestant(contestant.name, contestant.description, contestant.imageUrl)
  })

  console.log(`✅ ${sampleContestants.length} sample contestants initialized`)

  // Log default settings
  const settings = mockDb.getSettings()
  console.log('✅ Settings initialized:')
  console.log(`   Platform: ${settings.platformName}`)
  console.log(`   Vote Price: ${settings.votePrice}`)
  console.log(`   Max Votes per User: ${settings.maxVotesPerUser}`)
  console.log(`   Status: ${settings.isActive ? 'Active' : 'Inactive'}`)

  console.log('🌱 Database seed completed!')
  console.log('\n📝 Admin Credentials:')
  console.log('   Email: admin@example.com')
  console.log('   Password: admin123')
  console.log('   ⚠️  Change this password in production!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
