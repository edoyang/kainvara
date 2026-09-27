// npm run db:seed
import mongoose from 'mongoose'
import { seedDatabase } from './seed.js'

try {
  const summary = await seedDatabase()
  console.log(`Database: ${mongoose.connection.name}`)
  console.table(summary)
} catch (err) {
  console.error('Seed failed:', err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
