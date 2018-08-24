const Player = require('./server/player.js')
const express = require('express')
const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server, {})

const PORT = 3000

let SOCKET_LIST = {}

// Files from server directory

io.sockets.on('connection', (socket) => {
    console.log('Client connected!')

    socket.id = Math.random()
    SOCKET_LIST[socket.id] = socket
    Player.onConnect(socket)

    socket.on('disconnect', () => {
        delete SOCKET_LIST[socket.id]
        Player.onDisconnect(socket)
        // delete PLAYER_LIST[socket.id]
    })
})


setInterval(() => {
    const pack = Player.update();
    
    for (let i in SOCKET_LIST) {
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