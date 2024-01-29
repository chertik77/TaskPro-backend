import mongoose from 'mongoose'

import { app } from './app'

const DB_HOST =
  'mongodb+srv://Denys:nZlqN2oa35ko1QqO@cluster0.83ohyqy.mongodb.net/my-contacts?retryWrites=true&w=majority'

mongoose
  .connect(DB_HOST as string)
  .then(() => {
    app.listen(3000, () =>
      console.log(`Server running. Use our API on port: ${3000}`)
    )
  })
  .catch(e => {
    console.log(e.message)
    process.exit(1)
  })
