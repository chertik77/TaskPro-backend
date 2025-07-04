import { app } from './app'
import { env } from './config'

const port = env.PORT ?? 5432

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})

process.on('SIGTERM', () => {
  console.log(`SIGTERM signal received: closing HTTP server.`)
  process.exit()
})

process.on('SIGINT', () => {
  console.log(`SIGINT signal received: closing HTTP server.`)
  process.exit()
})
