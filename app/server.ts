import mongoose from 'mongoose'
import { app } from './app'

mongoose
  .connect(process.env.DB_HOST!)
  .then(() => {
    app.listen(7000, () =>
      console.log(`Database connected. Server listening on port 7000`)
    )
  })
  .catch(e => {
    console.log(e.message)
    process.exit(1)
  })

setInterval(() => {
  fetch('http://localhost:7000').then(() => console.log('Server online'))
}, 300000)
