import { app } from './app'

// eslint-disable-next-line no-restricted-syntax
const port = process.env.PORT || 10000

console.log('Starting server...')

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})
