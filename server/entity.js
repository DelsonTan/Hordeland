const Map = require('./map.js')
const BISON = require('../client/vendor/bison.js')
const initData = { players: [], enemies: [], projectiles: [] }
const updateData = { players: [], enemies: [], projectiles: [] }
const removeData = { players: [], enemies: [], projectiles: [] }

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
    return Math.floor(Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2)))
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
    Player.updateAll()
    Enemy.updateAll()
    Projectile.updateAll()
    const data = {
      init: {},
      update: {},
      remove: {}
    }
    if (initData.players.length > 0) {
      data.init.players = initData.players
      initData.players = []
    }
    if (initData.enemies.length > 0) {
      data.init.enemies = initData.enemies
      initData.enemies = []
    }
    if (initData.projectiles.length > 0) {
      data.init.projectiles = initData.projectiles
      initData.projectiles = []
    }
    if (updateData.players.length > 0) {
      data.update.players = updateData.players
      updateData.players = []
    }
    if (updateData.enemies.length > 0) {
      data.update.enemies = updateData.enemies
      updateData.enemies = []
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
    this.mouseAngle = 0
    this.score = 0
    this.rateOfFire = Player.baseRateOfFire
    this.baseSpeed = Player.baseSpeed
    this.speed = this.baseSpeed
    this.maxHp = Player.baseMaxHp
    this.currentHp = this.maxHp
    this.scoreValue = Player.baseScoreValue
    this.spriteCalc = 0
    this.projectileAngle = 0
    this.numProjectiles = 1
    this.name = params.name || ''
    this.randomSpawn()
    Player.list[this.id] = this
    initData.players.push(this.initRenderData)
  }

  static onConnect(socket) {
    const player = new Player({
      id: socket.id,
      map: Player.defaultMap,
      name: socket.playerName
    })
    socket.on('keyPress', (data) => {
      if (data.inputId === 'leftClick') {
        data.state ? player.speed = Math.floor(Player.baseSpeed * 0.60) : player.speed = Math.floor(Player.baseSpeed)
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
  // Only pushes player data to client update package if the data has changed
  static updateAll() {
    for (let i in Player.list) {
      const player = Player.list[i]
      let oldPlayerData = JSON.stringify(player)
      player.update()
      let newPlayerData = JSON.stringify(player)
      if (newPlayerData !== oldPlayerData) {
        updateData.players.push(player.updateRenderData)
      }
    }
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
    if (this.numProjectiles === 1) {
      new Projectile({
        source: this.id,
        angle: angle,
        x: this.x,
        y: this.y,
        map: this.map
      })
      return
    }
    if (this.numProjectiles === 2) {
      const dx = Math.floor(Math.abs(Math.sin(angle / 180 * Math.PI) * 10))
      const dy = Math.floor(Math.abs(Math.cos(angle / 180 * Math.PI) * 10))
      new Projectile({
        source: this.id,
        angle: angle,
        x: this.x - dx,
        y: this.y - dy,
        map: this.map
      })
      new Projectile({
        source: this.id,
        angle: angle,
        x: this.x + dx,
        y: this.y + dy,
        map: this.map
      })
      return
    }
    if (this.numProjectiles === 3) {
      const dx = Math.floor(Math.abs(Math.sin(angle / 180 * Math.PI) * 10))
      const dy = Math.floor(Math.abs(Math.cos(angle / 180 * Math.PI) * 10))
      new Projectile({
        source: this.id,
        angle: angle,
        x: this.x - dx,
        y: this.y - dy,
        map: this.map
      })
      new Projectile({
        source: this.id,
        angle: angle,
        x: this.x,
        y: this.y,
        map: this.map
      })
      new Projectile({
        source: this.id,
        angle: angle,
        x: this.x + dx,
        y: this.y + dy,
        map: this.map
      })
      return
    }
  }

  eliminate() {
    this.score = 0
    this.maxHp = Player.baseMaxHp
    this.currentHp = this.maxHp
    this.baseSpeed = Player.baseSpeed
    this.rateOfFire = Player.baseRateOfFire
    this.map = Player.defaultMap
    this.scoreValue = Player.baseScoreValue
    this.numProjectiles = 1
    this.randomSpawn()
  }

  updateStats(scoreValue) {
    const oldScore = this.score
    this.score += scoreValue
    if (oldScore < Player.baseScoreValue * 2) {
      if (this.score >= Player.baseScoreValue * 2) {
        this.scoreValue = Math.floor(1.5  * Player.baseScoreValue)
        this.maxHp      = Math.floor(1.4  * Player.baseMaxHp)
        this.currentHp += Math.floor(0.4  * Player.baseMaxHp)
        this.baseSpeed  = Math.floor(1.1  * Player.baseSpeed)
        this.rateOfFire = Math.floor(0.95 * Player.baseRateOfFire)
      }
    }
    if (oldScore < Player.baseScoreValue * 4) {
      if (this.score >= Player.baseScoreValue * 4) {
        this.scoreValue = Math.floor(2.0  * Player.baseScoreValue)
        this.maxHp      = Math.floor(1.8  * Player.baseMaxHp)
        this.currentHp += Math.floor(0.4  * Player.baseMaxHp)
        this.baseSpeed  = Math.floor(1.2  * Player.baseSpeed)
        this.rateOfFire = Math.floor(0.90 * Player.baseRateOfFire)
      }
    }
    if (oldScore < Player.baseScoreValue * 6) {
      if (this.score >= Player.baseScoreValue * 6) {
        this.scoreValue = Math.floor(2.5  * Player.baseScoreValue)
        this.maxHp      = Math.floor(2.2  * Player.baseMaxHp)
        this.currentHp += Math.floor(0.4  * Player.baseMaxHp)
        this.baseSpeed  = Math.floor(1.3  * Player.baseSpeed)
        this.rateOfFire = Math.floor(0.85 * Player.baseRateOfFire)
        this.numProjectiles = 2
      }
    }
    if (oldScore < Player.baseScoreValue * 8) {
      if (this.score >= Player.baseScoreValue * 6) {
        this.scoreValue = Math.floor(3.0  * Player.baseScoreValue)
        this.maxHp      = Math.floor(2.6  * Player.baseMaxHp)
        this.currentHp += Math.floor(0.4  * Player.baseMaxHp)
        this.baseSpeed  = Math.floor(1.4  * Player.baseSpeed)
        this.rateOfFire = Math.floor(0.80 * Player.baseRateOfFire)
      }
    }
    if (oldScore < Player.baseScoreValue * 10) {
      if (this.score >= Player.baseScoreValue * 6) {
        this.scoreValue = Math.floor(4.0  * Player.baseScoreValue)
        this.maxHp      = Math.floor(3.0 * Player.baseMaxHp)
        this.currentHp += Math.floor(0.4  * Player.baseMaxHp)
        this.baseSpeed  = Math.floor(1.5  * Player.baseSpeed)
        this.rateOfFire = Math.floor(0.75 * Player.baseRateOfFire)
        this.numProjectiles = 3
      }
    }
  }
}
// Class-level value properties
Player.list = {}
Player.socketList = {}
Player.baseMaxHp = 30
Player.baseSpeed = 20
Player.baseRateOfFire = 400
Player.baseScoreValue = 20
Player.defaultMap = 'forest'

class Enemy extends Entity {
  constructor(params) {
    super(params)
    this.allowedToFire = true
    this.rateOfFire = 100
    this.speed = Enemy.maxSpeed
    this.currentHp = 50
    this.maxHp = 50
    this.spriteCalc = 0
    this.projectileAngle = 0
    this.meleeDamage = 5
    this.map = 'cave'
    this.name = 'Bat'
    this.type = 'enemy'
    this.randomSpawn()
    this.targetLocation = null
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

  static updateAllTargetLocations() {
    for (let i in Enemy.list) {
      let enemy = Enemy.list[i]
      enemy.updateTargetLocation()
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
      targetLocation: this.targetLocation
    }
  }

  get UIData() {
    return {
      id: this.id,
      name: this.name
    }
  }

  get updateTargetData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      targetLocation: this.targetLocation
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
    let entityEliminated = false
    for (let i in Player.list) {
      const target = Player.list[i]
      if (this.isCollision(target, 15) && this.map === target.map) {
        target.currentHp -= this.meleeDamage
        if (target.currentHp <= 0) {
          target.eliminate()
          entityEliminated = true
        }
        let data = {
          players: [{
            id: target.id,
            currentHp: target.currentHp,
            x: target.x,
            y: target.y,
            map: target.map
          }]
        }
        for (let i in Player.socketList) {
          let socket = Player.socketList[i]
          socket.emit('update', BISON.encode(data))
          if (entityEliminated) {
            socket.emit('elimination', BISON.encode({ attacker: this.UIData, target: target.UIData }))
          }
        }
      }
    }

    // if (this.allowedToFire && this.pressingFire) {
    //   this.fireProjectile(this.projectileAngle)
    //   this.allowedToFire = false
    //   setTimeout(() => { this.allowedToFire = true }, this.rateOfFire)
    // }
  }

  updateTargetLocation() {
    if (Object.keys(Player.list).length > 0) {
      let closestDistance = Infinity
      for (let i in Player.list) {
        const player = Player.list[i]
        if (player.map === this.map) {
          const distance = this.getDistance(player)
          if (closestDistance > distance) {
            closestDistance = distance
            this.targetLocation = { x: player.x, y: player.y }
          }
        }
      }
      updateData.enemies.push(this.updateTargetData)
    }
  }

  updateVelocity() {
    if (this.targetLocation !== null) {
      if (Math.floor(this.targetLocation.x - this.x) > 4) {
        this.x += 6
      } else if (Math.floor(this.targetLocation.x - this.x) < 0) {
        this.x -= 6
      }
      if (Math.floor(this.targetLocation.y - this.y) > 4) {
        this.y += 6
      } else if (Math.floor(this.targetLocation.y - this.y) < 0) {
        this.y -= 6
      }
    } else {
      this.y += 0
      this.x += 0
    }
  }

  eliminate() {
    this.currentHp = this.maxHp
    this.randomSpawn()
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
  // Projectile deleted as soon as it hits something (no splash damage)
  // Take out return statements in for loop to allow splash, but this will cost a lot more performance issues
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
          if (attacker !== undefined) {
            attacker.updateStats(target.scoreValue)
          }
          target.eliminate()
          entityEliminated = true
        }
        let data = {
          players: [{
            id: target.id,
            currentHp: target.currentHp,
            x: target.x,
            y: target.y,
            map: target.map
          },
          {
            id: attacker.id,
            maxHp: attacker.maxHp,
            currentHp: attacker.currentHp,
            x: attacker.x,
            y: attacker.y,
            map: attacker.map
          }]
        }
        for (let id in Player.socketList) {
          let socket = Player.socketList[id]
          socket.emit('update', BISON.encode(data))
          if (entityEliminated && attacker !== undefined) {
            socket.emit('elimination', BISON.encode({ attacker: attacker.UIData, target: target.UIData }))
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
        target.currentHp -= this.damage
        if (target.currentHp <= 0) {
          if (attacker) {
            attacker.score += 1
          }
          entityEliminated = true
          target.eliminate()
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
            socket.emit('elimination', BISON.encode({ attacker: attacker.UIData, target: target.UIData }))
          }
        }
        delete Projectile.list[this.id]
        removeData.projectiles.push(this.id)
        return
      }
    }
  }
}
// Class-level value properties
Projectile.list = {}

module.exports = {
  "SOCKET_LIST": Player.socketList,
  "playerConnect": Player.onConnect,
  "playerDisconnect": Player.onDisconnect,
  "generateEnemies": Enemy.generateEnemies,
  "updateEnemyTargetLocations": Enemy.updateAllTargetLocations,
  "getFrameUpdateData": Entity.getFrameUpdateData
}