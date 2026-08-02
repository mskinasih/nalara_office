import * as dotenv from 'dotenv'
import { prisma } from './lib/prisma'

dotenv.config()

async function main() {
  await prisma.schedule.deleteMany({})
  console.log('Deleted all schedules')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })

