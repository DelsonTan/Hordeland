const Player = require('./server/player.js')
const express = require('express')
const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server, {})

const PORT = 3000

let SOCKET_LIST = {}
let PLAYER_LIST = {}



io.sockets.on('connection', (socket) => {
    console.log('Client connected!')

    socket.id = Math.random()

    SOCKET_LIST[socket.id] = socket

    const player = new Player(socket.id)
    PLAYER_LIST[socket.id] = player

    socket.on('keyPress', (data) => {
        if (data.inputId === 'left') {
            player.pressingLeft = data.state
        } else if (data.inputId === 'right') {
            player.pressingRight = data.state
        } else if (data.inputId === 'up') {
            player.pressingUp = data.state
        } else if (data.inputId === 'down') {
            player.pressingDown = data.state
        }
    })

    socket.on('disconnect', () => {
        delete SOCKET_LIST[socket.id]
        delete PLAYER_LIST[socket.id]
    })
})


setInterval(() => {
    let pack = []
    for (let i in PLAYER_LIST) {
        let player = PLAYER_LIST[i]
        player.updatePosition()
        pack.push({
            x: player.x,
            y: player.y,
            number: player.number
        })

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