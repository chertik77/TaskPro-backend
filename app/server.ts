import mongoose from 'mongoose'

import { app } from './app'

const port = Number(process.env.PORT) || 3000

mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => {
    app.listen(port, () =>
      console.log(`Database connected. Server listening on port ${port}`)
    )
  })
  .catch(e => {
    console.log(e.message)
    process.exit(1)
  })
