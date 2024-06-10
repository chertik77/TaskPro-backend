import mongoose from 'mongoose'
import { app } from './app'

const port = Number(process.env.PORT) || 3000

mongoose
  .connect(process.env.DB_HOST!)
  .then(() => {
    app.listen(port, () =>
      console.log(`Database connected. Server listening on port 7000`)
    )
  })
  .catch(e => {
    console.log(e.message)
    process.exit(1)
  })

setTimeout(() => {
  fetch('http://localhost:7000').then(() => console.log("I'm alive"))
}, 5 * 60 * 1000)
