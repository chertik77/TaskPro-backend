import mongoose from 'mongoose'
import { app } from './app'

const { DB_HOST } = process.env

mongoose
  .connect(DB_HOST as string)
  .then(() => {
    app.listen(7000, () =>
      console.log(`Database connected. Server listening on port 7000`)
    )
  })
  .catch(e => {
    console.log(e.message)
    process.exit(1)
  })
