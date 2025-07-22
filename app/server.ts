import { app } from './app'
import { env } from './config'

const port = env.PORT ?? 5432

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})
