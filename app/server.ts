import { app } from './app'
import { env } from './config'

const port = env.PORT || 9999

console.log('Starting server...')

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})
