import mongoose from 'mongoose'
import { app } from './app'

const port = Number(process.env.PORT) || 3000

mongoose
  .connect(process.env.DB_HOST!)
  .then(() => {
    app.listen(port, () =>
      console.log(`Database connected. Server listening on port ${port}`)
    )
  })
  .catch(e => {
    console.log(e.message)
    process.exit(1)
  })
