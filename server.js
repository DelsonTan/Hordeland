const express = require('express')
const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server, {})

const PORT = 3000

let SOCKET_LIST = {}

io.sockets.on('connection', (socket) => {
    console.log('Client connected!')

    socket.id = Math.random()
    socket.x = 0
    socket.y = 0
    socket.number = "" + Math.floor(10 * Math.random())
    SOCKET_LIST[socket.id] = socket

    socket.on('disconnect', () => {
        delete SOCKET_LIST[socket.id]
    })
})


setInterval(() => {
    let pack = []
    for(let i in SOCKET_LIST) {
        let socket = SOCKET_LIST[i]
        socket.x++
        socket.y++
        pack.push({
            x: socket.x,
            y: socket.y,
            number: socket.number
        })
    }

    for(let i in SOCKET_LIST) {
        let socket = SOCKET_LIST[i]
        socket.emit('newPositions', pack)
    }
}, 40)

app.use('/client', express.static(__dirname + '/client'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html')
})

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}!`)
  })