import mongoose from 'mongoose'
import { app } from './app'

const { PORT, DB_HOST } = process.env

mongoose
  .connect(DB_HOST as string)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running. Use our API on port: ${PORT}`)
    )
  })
  .catch(e => {
    console.log(e.message)
    process.exit(1)
  })
