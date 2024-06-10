import mongoose from 'mongoose'
import '../keep_alive'
import { app } from './app'
const port = Number(process.env.PORT) || 3000

mongoose
  .connect(process.env.DB_HOST!)
  .then(() => {
    app.listen(port, '0.0.0.0', () =>
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
