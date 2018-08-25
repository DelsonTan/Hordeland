const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {})
const PORT = 3000

const {Player, Projectile} = require('./server/entity.js')
// IMPORTANT: SET TO FALSE IN PRODUCTION
const DEBUG = true

let SOCKET_LIST = {}

io.sockets.on('connection', (socket) => {
    console.log('Client connected!')

    socket.id = Math.random()
    SOCKET_LIST[socket.id] = socket
    Player.onConnect(socket)

    socket.on('evalMessage', (data) => {
        if (!DEBUG) {
            return
        }
        try {
            var res = eval(data.text)
            socket.emit('evalAnswer', res)
        } catch(error) {
            socket.emit('evalAnswer', `Error, invalid input: /${data.text}`)
        }

    })

    socket.on('sendMessage', (data) => {
        const playerName = (socket.id).toString().slice(2, 7)
        for (let i in SOCKET_LIST) {
            SOCKET_LIST[i].emit('addToChat', `${playerName}: ${data.text}`)
        }
    })

    socket.on('disconnect', () => {
        delete SOCKET_LIST[socket.id]
        Player.onDisconnect(socket)
        // delete PLAYER_LIST[socket.id]
    })
})


setInterval(() => {
    const pack = {
        players: Player.update(),
        projectiles: Projectile.update()
    }
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