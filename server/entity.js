const Map = require('./map.js')
const BISON = require('../client/vendor/bison.js')
const initData = { players: [], enemies: [], projectiles: [] }
const removeData = { players: [], projectiles: [] }

class Entity {
  constructor(params) {
    this.id = params.id || null
    this.x = params.x || 300
    this.y = params.y || 300
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
  isCollision(point, radius) {
    let distance = this.getDistance(point)
    return distance < radius
  }

  randomSpawn() {
    this.x = Math.floor(Math.random() * Map.list[this.map].width)
    this.y = Math.floor(Math.random() * Map.list[this.map].height)
    while (Map.list[this.map].isPositionWall(this)) {
      this.x = Math.floor(Math.random() * Map.list[this.map].width)
      this.y = Math.floor(Math.random() * Map.list[this.map].height)
    }
  }

  static getFrameUpdateData() {

    Projectile.updateAll()
    // Enemy.updateAll()
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
      initData.players = []
    }
    if (initData.enemies && initData.enemies.length > 0) {
      data.init.enemies = initData.enemies
      initData.enemies = []
    }
    if (initData.projectiles.length > 0) {
      data.init.projectiles = initData.projectiles
      initData.projectiles = []
    }
    if (updateRenderData.players.length > 0) {
      data.update.players = updateRenderData.players
    }
    if (removeData.players.length > 0) {
      data.remove.players = removeData.players
      removeData.players = []
    }
    if (removeData.projectiles.length > 0) {
      data.remove.projectiles = removeData.projectiles
      removeData.projectiles = []
    }
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
    this.maxHp = Player.baseMaxHp
    this.currentHp = this.maxHp
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
      map: 'forest',
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
      maps: Map.getAllInitData(),
      enemies: Enemy.getAllInitData()
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
    this.updateVelocity()
    super.update()

    if (this.pressingRight || this.pressingDown || this.pressingLeft || this.pressingUp)
      this.spriteCalc += 0.25
    let playPos = Map.list[this.map].isPositionWall(this)
    if (playPos && playPos !== 29 && playPos !== 934) {
      this.x = prevX
      this.y = prevY
    }
    Map.list[this.map].isPositionCaveEntry(this);
    if (this.allowedToFire && this.pressingFire) {
      this.fireProjectile(this.projectileAngle)
      this.allowedToFire = false
      setTimeout(() => { this.allowedToFire = true }, this.rateOfFire)
    }
  }

  updateVelocity() {
    if (this.pressingLeft) { this.dx = -this.speed } else if (this.pressingRight) { this.dx = this.speed } else { this.dx = 0 }
    if (this.pressingUp) { this.dy = -this.speed } else if (this.pressingDown) { this.dy = this.speed } else { this.dy = 0 }
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
}
// Class-level value properties
Player.list = {}
Player.socketList = {}
Player.baseMaxHp = 50
Player.maxSpeed = 20

class Enemy extends Entity {
  constructor(params) {
    super(params)
    this.allowedToFire = true
    this.rateOfFire = 100
    this.speed = Enemy.maxSpeed
    this.currentHp = 5
    this.maxHp = 5
    this.spriteCalc = 0
    this.projectileAngle = 0
    this.map = 'cave'
    this.name = 'Bat'
    this.type = 'enemy'
    this.randomSpawn()
    this.target = null
    Enemy.list[this.id] = this
    initData.enemies.push(this.initialData)
  }

  static updateAll() {
    for (let i in Enemy.list) {
      let enemy = Enemy.list[i]
      enemy.update()
      // let projPos = Map.list[enemy.map].isPositionWall(enemy)
      // if (projPos && projPos === 468) {
      //   projectile.toRemove = true
      // }
    }
  }

  static getAllInitData() {
    const enemies = []
    for (let i in Enemy.list) { enemies.push(Enemy.list[i].initialData) }
    return enemies
  }

  static generateEnemies() {
    if (Object.keys(Enemy.list).length < Enemy.maxNumber) {
      let id = Math.floor(1000 * Math.random())
      new Enemy({ id })
    }
  }

  static updateTarget() {
    for (let i in Enemy.list) {
      let enemy = Enemy.list[i]
      enemy.updateTarget()
    }
  }

  get initialData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      currentHp: this.currentHp,
      maxHp: this.maxHp,
      map: this.map,
      spriteCalc: this.spriteCalc,
      target: this.target
    }
  }

  get UIData() {
    return {
      id: this.id,
      name: this.name,
      score: this.score
    }
  }

  update() {
    // const prevX = this.x
    // const prevY = this.y
    this.updateVelocity()

    // this.spriteCalc += 0.25
    // if (Map.list[this.map].isPositionWall(this)) {
    //   this.x = prevX
    //   this.y = prevY
    // }
    for (let i in Player.list) {
      const target = Player.list[i]
      if (this.isCollision(target, 15) && this.map === target.map) {
        target.currentHp -= 1
        if (target.currentHp <= 0) {
          target.currentHp = target.maxHp
          target.score = 0
          target.randomSpawn()
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
        }
      }
    }

    // if (this.allowedToFire && this.pressingFire) {
    //   this.fireProjectile(this.projectileAngle)
    //   this.allowedToFire = false
    //   setTimeout(() => { this.allowedToFire = true }, this.rateOfFire)
    // }
  }

  updateTarget() {
    let closestDistance = Infinity
    if (Object.keys(Player.list).length > 0) {
      for (let i in Player.list) {
        let distanceX = Math.floor(Player.list[i].x - this.x)
        let distanceY = Math.floor(Player.list[i].y - this.y)
        let distance = distanceX + distanceY
        if (closestDistance > distance) {
          closestDistance = distance
          this.target = Player.list[i]
        }
      }
    }
  }

  updateVelocity() {
    if (this.target !== null) {
      if (Math.floor(this.target.x - this.x) > 4) {
        this.x += 3
      } else if (Math.floor(this.target.x - this.x) < 0) {
        this.x -= 3
      }
      if (Math.floor(this.target.y - this.y) > 4) {
        this.y += 3
      } else if (Math.floor(this.target.y - this.y) < 0) {
        this.y -= 3
      }
    } else {
      this.y += 0
      this.x += 0
    }
  }

  // fireProjectile(angle) {
  //   const projectile = new Projectile({
  //     source: this.type,
  //     angle: angle,
  //     x: this.x,
  //     y: this.y,
  //     map: this.map
  //   })
  //   projectile.x = this.x
  //   projectile.y = this.y
  // }
}
// Class-level value properties
Enemy.list = {}
Enemy.maxNumber = 10
Enemy.maxSpeed = 12
setInterval(() => { Enemy.updateAll() }, 40)
setInterval(() => { Enemy.updateTarget() }, 3000)

//------------------------------------------------PROJECTILES----------------------------------------------//

class Projectile extends Entity {
  constructor(params) {
    super(params)
    // source: the id of the entity that fired this projectile
    this.source = params.source
    this.id = Math.floor(Math.random() * 1000)
    this.map = params.map
    this.angle = params.angle
    this.speed = 50
    this.damage = 10
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
  // Queue projectile for removal when timer exceeds 15
  // Projectile deleted as soon as it hits something (no splash damage), take out return statements in for loop to allow splash
  update() {
    if (this.timer++ > 15) { this.toRemove = true }
    super.update()
    let entityEliminated = false
    const attacker = Player.list[this.source]
    for (let i in Player.list) {
      const target = Player.list[i]

      if (this.map === target.map && this.isCollision(target, 30) && this.source !== target.id) {
        target.currentHp -= this.damage
        if (target.currentHp <= 0) {
          if (attacker !== undefined) { attacker.score += 1 }
          entityEliminated = true
          target.score = 0
          target.currentHp = target.maxHp
          target.randomSpawn()
        }
        let data = {
          players: [{
            id: target.id,
            currentHp: target.currentHp,
            x: target.x,
            y: target.y,
          }]
        }
        for (let id in Player.socketList) {
          let socket = Player.socketList[id]
          socket.emit('update', BISON.encode(data))
          if (entityEliminated && attacker !== undefined) {
            socket.emit('elimination', BISON.encode({ players: [attacker.UIData, target.UIData] }))
          }
        }
        delete Projectile.list[this.id]
        removeData.projectiles.push(this.id)
        return
      }
    }

    for (let i in Enemy.list) {
      const target = Enemy.list[i]
      if (this.map === target.map && this.isCollision(target, 30)) {
        target.currentHp -= 1
        if (target.currentHp <= 0) {
          if (attacker) { attacker.score += 1 }
          entityEliminated = true
          target.currentHp = target.maxHp
          target.randomSpawn()
        }
        let data = {
          enemies: [{
            id: target.id,
            currentHp: target.currentHp,
            x: target.x,
            y: target.y
          }]
        }
        for (let i in Player.socketList) {
          let socket = Player.socketList[i]
          socket.emit('update', BISON.encode(data))
          if (entityEliminated && attacker !== undefined) {
            socket.emit('elimination', BISON.encode({ players: [attacker.UIData, target.UIData] }))
          }
        }
        delete Projectile.list[this.id]
        removeData.projectiles.push(this.id)
        return
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
  "SOCKET_LIST": Player.socketList,
  "generateEnemies": Enemy.generateEnemies,
  "PlayerList": Player.list,
  "PlayerSocketList": Player.socketList,
  "EnemyList": Enemy.list
}