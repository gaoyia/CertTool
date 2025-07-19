import https from 'https'
import fs from 'fs'

const options = {
  key: fs.readFileSync('private_key.pem'),
  cert: fs.readFileSync('certificate.pem')
}
console.log('Server running at https://localhost:8000')

https
  .createServer(options, (req, res) => {
    res.writeHead(200)
    res.end('hello world\n')
  })
  .listen(8000)
