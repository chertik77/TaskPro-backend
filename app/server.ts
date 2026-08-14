import { serve } from '@hono/node-server'

import { app } from './app'

// eslint-disable-next-line no-restricted-syntax
const port = Number(process.env.PORT) || 10000

console.log('Starting server...')

serve({ fetch: app.fetch, port }, info => {
  console.log(`Server started on port ${info.port}`)
})
