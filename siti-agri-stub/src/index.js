// Entry point for the Siti Agri stub service.

import process from 'node:process'
import { createServer } from './server.js'

const server = await createServer()
await server.start()

console.log(`Siti Agri Stub running on ${server.info.uri}`)

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection', err)
  process.exitCode = 1
})
