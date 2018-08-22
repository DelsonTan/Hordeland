const express = require('express')
const app = express()
const server = require('http').Server(app)
const PORT = 3000

app.use('/client', express.static(__dirname + '/client'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html')
})

server.listen(PORT, () => {
    console.log(`alpha listening on port ${PORT}!`);
  });