const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {});
const PORT = 3000
const BISON = require('./client/vendor/bison.js');

const { SOCKET_LIST, playerDisconnect, playerConnect, getFrameUpdateData } = require('./server/entity.js')
// IMPORTANT: SET TO FALSE IN PRODUCTION
const DEBUG = true

io.sockets.on('connection', (socket) => {
    socket.id = Math.floor(Math.random() * 1000)
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
    const initData = JSON.stringify(data.init)
    const updateData = BISON.encode(data.update)
    const removeData = BISON.encode(data.remove)
    for (let i in SOCKET_LIST) {
        let socket = SOCKET_LIST[i]
        if (data.init.players.length > 0 || data.init.projectiles.length > 0) { socket.emit('init', initData) }
        if (data.update.players.length > 0 || data.update.projectiles.length > 0) { socket.emit('update', updateData) }
        if (data.remove.players.length > 0 || data.remove.projectiles.length > 0) { socket.emit('remove', removeData) }
    }
}, 40)

app.use('/client', express.static(__dirname + '/client'))
app.get('/', (req, res) => { res.sendFile(__dirname + '/client/index.html') })
server.listen(PORT, () => { console.log(`Server listening on port ${PORT}!`) })