import { app } from './app'
import { env } from './config'

const port = env.PORT || 10000

console.log('Starting server...')

app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`)
})
