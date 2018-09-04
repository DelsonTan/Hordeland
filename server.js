const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {})
const PORT = process.env.PORT || 3000;
const BISON = require('./client/vendor/bison.js')
const { SOCKET_LIST, playerDisconnect, playerConnect, getFrameUpdateData, generateEnemies, updateBatsLocation, generateMaps } = require('./server/entity.js')
// IMPORTANT: SET TO FALSE IN PRODUCTION
const DEBUG = true

io.sockets.on('connection', (socket) => {
  socket.on('signIn', function(data) {
    socket.playerName = data.username
    socket.id = Math.floor(Math.random() * 1000)
    playerConnect(socket)
    socket.emit('signInResponse', { success: true })
  })
  console.log(`Client${socket.id} connected!`)
  socket.on('evalMessage', (data) => {
    if (!DEBUG) {
      return
    }
    try {
      var res = eval(data.text)
      socket.emit('evalAnswer', res)
    } catch (error) {
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
    if (Object.keys(data.init).length > 0) { socket.emit('init', initData) }
    if (Object.keys(data.update).length > 0) { socket.emit('update', updateData) }
    if (Object.keys(data.remove).length > 0) { socket.emit('remove', removeData) }
  }
}, 40)

generateMaps()
generateEnemies()
setInterval(() => {
  updateBatsLocation()
}, 100)

app.use('/client', express.static(__dirname + '/client'))
app.get('/', (req, res) => { res.sendFile(__dirname + '/client/index.html') })
server.listen(PORT, () => { console.log(`Server listening on port ${PORT}!`) })