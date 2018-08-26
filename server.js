const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {})
const PORT = 3000

const { playerDisconnect, playerConnect, getFrameUpdateData } = require('./server/entity.js')
// IMPORTANT: SET TO FALSE IN PRODUCTION
const DEBUG = true
let SOCKET_LIST = {}

io.sockets.on('connection', (socket) => {
    socket.id = Math.random()
    SOCKET_LIST[socket.id] = socket
    playerConnect(socket)
    console.log(`Client${socket.id} connected!`)
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
        playerDisconnect(socket)
    })
})

setInterval(() => {
    const data = getFrameUpdateData()
    for (let i in SOCKET_LIST) {
        let socket = SOCKET_LIST[i]
        socket.emit('init', data.init)
        socket.emit('update', data.update)
        socket.emit('remove', data.remove)
    }
}, 40)

app.use('/client', express.static(__dirname + '/client'))
app.get('/', (req, res) => { res.sendFile(__dirname + '/client/index.html') })
server.listen(PORT, () => { console.log(`Server listening on port ${PORT}!`) })