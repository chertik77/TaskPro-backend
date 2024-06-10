import http from 'http'

http
  .createServer((_, res) => {
    res.write(`I'm alive`)
    res.end()
  })
  .listen(7000)
