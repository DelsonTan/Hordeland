const Map = require('./map.js')
const BISON = require('../client/vendor/bison.js')
const initData = { players: [], projectiles: [] }
const removeData = { players: [], projectiles: [] }

class Entity {
  constructor(params) {
    this.id = params.id || null
    this.x = params.x || 500
    this.y = params.y || 500
    this.dx = 0
    this.dy = 0
    this.map = params.map || 'forest'
  }

  update() { this.updatePosition() }

  updatePosition() {
    this.x += this.dx
    this.y += this.dy
  }
  getDistance(point) {
    return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2))
  }

  static getFrameUpdateData() {
    Projectile.updateAll()
    const updateRenderData = {
      players: Player.updateAll()
    }
    const data = {
      init: {},
      update: {},
      remove: {}
    }
    if (initData.players.length > 0) {
      data.init.players = initData.players
    }
    if (initData.projectiles.length > 0) {
      data.init.projectiles = initData.projectiles
    }
    if (updateRenderData.players.length > 0) {
      data.update.players = updateRenderData.players
    }
    if (removeData.players.length > 0) {
      data.remove.players = removeData.players
    }
    if (removeData.projectiles.length > 0) {
      data.remove.projectiles = removeData.projectiles
    }
    Object.freeze(data)
    initData.players = []
    initData.projectiles = []
    removeData.players = []
    removeData.projectiles = []
    return data
  }
}

class Player extends Entity {
  constructor(params) {
    super(params)
    this.pressingLeft = false
    this.pressingRight = false
    this.pressingUp = false
    this.pressingDown = false
    this.pressingFire = false
    this.allowedToFire = true
    this.rateOfFire = 100
    this.mouseAngle = 0
    this.speed = Player.maxSpeed
    this.currentHp = 5
    this.maxHp = 5
    this.score = 0
    this.spriteCalc = 0
    this.projectileAngle = 0
    this.name = params.name || ''
    this.randomSpawn()
    Player.list[this.id] = this
    initData.players.push(this.initRenderData)
  }

  static onConnect(socket) {
    const player = new Player({
      id: socket.id,
      map: 'field',
      name: socket.playerName
    })

    socket.on('keyPress', (data) => {
      if (data.inputId === 'leftClick') {
        data.state ? player.speed = Math.floor(Player.maxSpeed * 0.60) : player.speed = Math.floor(Player.maxSpeed)
      }
      if (data.inputId === 'left') {
        player.mouseAngle = 135
        player.pressingLeft = data.state
      } else if (data.inputId === 'right') {
        player.mouseAngle = 44
        player.pressingRight = data.state
      } else if (data.inputId === 'up') {
        player.mouseAngle = 225
        player.pressingUp = data.state
      } else if (data.inputId === 'down') {
        player.mouseAngle = 45
        player.pressingDown = data.state
      } else if (data.inputId === 'leftClick') {
        player.pressingFire = data.state
        player.mouseAngle = data.angle
        player.projectileAngle = data.angle
      } else if (data.inputId === 'mouseAngle') {
        player.projectileAngle = data.state
      }
    })
    socket.emit('init', JSON.stringify({
      selfId: socket.id,
      players: Player.getAllInitRenderData(),
      projectiles: Projectile.getAllInitData(),
      maps: Map.getAllInitData()
    }))
    socket.emit('initUI', JSON.stringify({
      players: Player.getAllInitUIData()
    }))
    for (let i in Player.socketList) {
      const otherSocket = Player.socketList[i]
      otherSocket.emit('updateUI', JSON.stringify({
        players: [player.UIData]
      }))
    }
    Player.socketList[socket.id] = socket

  }

  static updateAll() {
    const data = []
    for (let i in Player.list) {
      const player = Player.list[i]
      let oldPlayerData = JSON.stringify(player)
      player.update()
      let newPlayerData = JSON.stringify(player)
      if (newPlayerData !== oldPlayerData) {
        data.push(player.updateRenderData)
      }
    }
    return data
  }

  static onDisconnect(socket) {
    delete Player.list[socket.id]
    removeData.players.push(socket.id)
  }

  static getAllInitRenderData() {
    const players = []
    for (let i in Player.list) { players.push(Player.list[i].initRenderData) }
    return players
  }

  static getAllInitUIData() {
    const players = []
    for (let i in Player.list) { players.push(Player.list[i].UIData) }
    return players
  }

  get initRenderData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      currentHp: this.currentHp,
      maxHp: this.maxHp,
      map: this.map,
      spriteCalc: this.spriteCalc,
      projectileAngle: this.projectileAngle,
      name: this.name
    }
  }

  get UIData() {
    return {
      id: this.id,
      name: this.name,
      score: this.score
    }
  }

  get updateRenderData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      currentHp: this.currentHp,
      map: this.map,
      mouseAngle: this.mouseAngle,
      spriteCalc: this.spriteCalc,
      projectileAngle: this.projectileAngle
    }
  }

  update() {
    const prevX = this.x
    const prevY = this.y
    this.updateSpeed()
    super.update()

    if (this.pressingRight || this.pressingDown || this.pressingLeft || this.pressingUp)
      this.spriteCalc += 0.25
    if (Map.list[this.map].isPositionWall(this)) {
      this.x = prevX
      this.y = prevY
    }

    if (this.allowedToFire && this.pressingFire) {
      this.fireProjectile(this.projectileAngle)
      this.allowedToFire = false
      setTimeout(() => { this.allowedToFire = true }, this.rateOfFire)
    }
  }

  updateSpeed() {
    if (this.pressingLeft) { this.dx = -this.speed } 
    else if (this.pressingRight) { this.dx = this.speed } 
    else { this.dx = 0 }
    if (this.pressingUp) { this.dy = -this.speed } 
    else if (this.pressingDown) { this.dy = this.speed } 
    else { this.dy = 0 }
  }

  fireProjectile(angle) {
    const projectile = new Projectile({
      source: this.id,
      angle: angle,
      x: this.x,
      y: this.y,
      map: this.map
    })
    projectile.x = this.x
    projectile.y = this.y
  }

  randomSpawn() {
    this.x = Math.floor(Math.random() * Map.list[this.map].width)
    this.y = Math.floor(Math.random() * Map.list[this.map].height)
    // prevent players from spawning into walls
    while (Map.list[this.map].isPositionWall(this)) {
      this.x = Math.floor(Math.random() * Map.list[this.map].width)
      this.y = Math.floor(Math.random() * Map.list[this.map].height)
    }
  }
}
// Class-level value property: list of all current players
Player.list = {}
Player.socketList = {}
Player.maxSpeed = 20

class Projectile extends Entity {
  constructor(params) {
    super(params)
    // source: the id of the entity that fired this projectile
    this.source = params.source
    this.id = Math.floor(Math.random() * 1000)
    this.map = params.map
    this.angle = params.angle
    this.speed = 50
    this.dx = Math.floor(Math.cos(params.angle / 180 * Math.PI) * this.speed)
    this.dy = Math.floor(Math.sin(params.angle / 180 * Math.PI) * this.speed)
    this.timer = 0
    this.toRemove = false
    Projectile.list[this.id] = this
    initData.projectiles.push(this.initRenderData)
  }

  static updateAll() {

    for (let i in Projectile.list) {
      let projectile = Projectile.list[i]
      projectile.update()
      let projPos = Map.list[projectile.map].isPositionWall(projectile)
      if (projPos && projPos === 468) {
        projectile.toRemove = true
      }
      if (projectile.toRemove) {
        delete Projectile.list[i]
        removeData.projectiles.push(projectile.id)
      }
    }
  }

  static getAllInitData() {
    const projectiles = []
    for (let i in Projectile.list) { projectiles.push(Projectile.list[i].initRenderData) }
    return projectiles
  }

  get initRenderData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      map: this.map,
      angle: this.angle
    }
  }

  get updateRenderData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y
    }
  }
  // Queue projectile for removal when timer exceeds 50
  update() {
    if (this.timer++ > 15) { this.toRemove = true }
    super.update()
    for (let i in Player.list) {
      const target = Player.list[i]
      if (this.map === target.map && this.getDistance(target) < 30 && this.source !== target.id) {
        target.currentHp -= 1
        if (target.currentHp <= 0) {
          const attacker = Player.list[this.source]
          if (attacker) { attacker.score += 1 }
          target.currentHp = target.maxHp
          target.randomSpawn()
          this.toRemove = true
          for (let i in Player.socketList) {
            let socket = Player.socketList[i]
            socket.emit('updateScore', BISON.encode({ players: [attacker.UIData, target.UIData] }))
          }
          let attackerSocket = Player.socketList[attacker.id]
          let targetSocket = Player.socketList[target.id]
          attackerSocket.emit('eliMessage', BISON.encode({ players: [attacker.UIData, target.UIData] }))
          targetSocket.emit('eliMessage', BISON.encode({ players: [attacker.UIData, target.UIData] }))
        }
        for (let i in Player.socketList) {
          let socket = Player.socketList[i]
          let data = {
            players: [{
              id: target.id,
              currentHp: target.currentHp,
              x: target.x,
              y: target.y
            }]
          }
          socket.emit('update', BISON.encode(data))
          delete Projectile.list[this.id]
          removeData.projectiles.push(this.id)
        }
      }
    }
  }
}
// Class-level value property: list of all current projectiles
Projectile.list = {}
module.exports = {
  "playerConnect": Player.onConnect,
  "playerDisconnect": Player.onDisconnect,
  "getFrameUpdateData": Entity.getFrameUpdateData,
  "SOCKET_LIST": Player.socketList
}