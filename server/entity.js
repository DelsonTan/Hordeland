const Map = require('./map.js')
const BISON = require('../client/vendor/bison.js')
const initData = { players: [], enemies: [], projectiles: [], upgrades: [] }
const updateData = { players: [], enemies: [], projectiles: [], upgrades: [] }
const removeData = { players: [], enemies: [], projectiles: [], upgrades: [] }

class Entity {
  constructor(params) {
    this.id = params.id || null
    this.x = params.x
    this.y = params.y
    this.dx = params.dx || 0
    this.dy = params.dy || 0
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

  randomSpawn(xpos, ypos, width, height) {
    if (this.name === "Joel") {
      this.x = 230
      this.y = 200
    } else {
      this.x = Math.floor(Math.random() * width) - xpos
      this.y = Math.floor(Math.random() * height) - ypos
      while (Map.list[this.map].isPositionWall(this)) {
        this.x = xpos + Math.floor(Math.random() * width)
        this.y = ypos + Math.floor(Math.random() * height)
      }
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
    if (initData.upgrades.length > 0) {
      data.init.upgrades = initData.upgrades
      initData.upgrades = []
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
    this.rangedDamage = Player.baseRangedDamage
    this.rateOfFire = Player.baseRateOfFire
    this.baseSpeed = Player.baseSpeed
    this.speedPenalty = Player.baseSpeedPenalty
    this.speed = this.baseSpeed
    this.maxHp = Player.baseMaxHp
    this.currentHp = this.maxHp
    this.spreadMod = Player.baseSpreadMod
    this.scoreValue = Player.baseScoreValue
    this.spriteCalc = 0
    this.projectileAngle = 0
    this.numProjectiles = 1
    this.mapChanging = false
    this.type = 'player'
    this.name = params.name || ''
    this.randomSpawn(0, 0, Map.list[this.map].width, Map.list[this.map].height)
    Player.list[this.id] = this
    initData.players.push(this.initRenderData)
  }

  static onConnect(socket) {
    const player = new Player({
      id: socket.id,
      map: Player.defaultMap,
      name: socket.playerName || `Anon${socket.id}`
    })
    socket.on('keyPress', (data) => {
      if (data.inputId === 'leftClick') {
        data.state ? player.speed = Math.floor(player.baseSpeed * player.speedPenalty) : player.speed = player.baseSpeed
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
    socket.on('changeMap', function(data) {
      if (player.mapChanging === false) {
        player.mapChanging = true
        socket.emit('counter', { timer: 5, player: player })
        setTimeout(() => {
          player.map === 'pvp-forest' ? player.respawn('forest') : player.respawn('pvp-forest')
          player.mapChanging = false
          let data = { players: [player.updateRenderData] }
          for (let i in Player.socketList) {
            let socket = Player.socketList[i]
            socket.emit('update', BISON.encode(data))
          }
        }, 5000)
      }
    })
    socket.emit('init', JSON.stringify({
      selfId: socket.id,
      players: Player.getAllInitRenderData(),
      projectiles: Projectile.getAllInitData(),
      maps: Map.getAllInitData(),
      enemies: Enemy.getAllInitData(),
      upgrades: Upgrade.getAllInitData()

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
      const oldPlayerData = JSON.stringify(player)
      player.update()
      const newPlayerData = JSON.stringify(player)
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
      name: this.name,
      mapChanging: this.mapChanging
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
      projectileAngle: this.projectileAngle,
      mapChanging: this.mapChanging
    }
  }

  get respawnData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      currentHp: this.currentHp,
      maxHp: this.maxHp,
      map: this.map
    }
  }

  update() {
    const prevX = this.x
    const prevY = this.y
    this.updateVelocity()
    super.update()
    for (let i in Upgrade.list) {
      const target = Upgrade.list[i]
      if (this.isCollision(target, 32) && this.map === target.map && target.used === false) {
        target.sendUsedUpgrade(this);
        target.restore();
      }
    }

    if (this.pressingRight || this.pressingDown || this.pressingLeft || this.pressingUp) {
      this.spriteCalc += 0.25
    }
    let playPos = Map.list[this.map].isPositionWall(this)
    if (playPos && playPos !== 29 && playPos !== 934 && playPos !== 1488 && playPos !== 2952) {
      this.x = prevX
      this.y = prevY
    }

    if ((Map.list[this.map].isPositionCaveEntry(this)) === 934) {
      this.map = 'cave'
      this.x = 406
      this.y = 860
    } else if ((Map.list[this.map].isPositionCaveEntry(this)) === 29) {
      this.map = 'forest'
      this.x = 1140
      this.y = 2325
    } else if ((Map.list[this.map].isPositionCaveEntry(this)) === 1488) {
      console.log(this.x, this.y)
      this.map = 'forest'
      this.x = 1082
      this.y = 390
    } else if ((Map.list[this.map].isPositionCaveEntry(this)) === 2952) {
      console.log(this.x, this.y)
      this.map = 'house'
      this.x = 830
      this.y = 880
    }


    if (this.allowedToFire && this.pressingFire) {
      this.fireProjectiles(this.projectileAngle, this.numProjectiles, this.x, this.y)
      this.allowedToFire = false
      setTimeout(() => { this.allowedToFire = true }, this.rateOfFire)
    }
  }

  updateVelocity() {
    if (this.pressingLeft) { this.dx = -this.speed } else if (this.pressingRight) { this.dx = this.speed } else { this.dx = 0 }
    if (this.pressingUp) { this.dy = -this.speed } else if (this.pressingDown) { this.dy = this.speed } else { this.dy = 0 }
  }

  fireProjectiles(angle, numProjectiles, xpos, ypos) {
    if (numProjectiles === 1) {
      new Projectile({
        source: this.id,
        angle: angle,
        x: xpos,
        y: ypos,
        map: this.map
      })
    } else {
      let startingAngle
      if (numProjectiles % 2 !== 0) {
        startingAngle = this.projectileAngle - (numProjectiles - 1) / 2 * this.spreadMod
      } else {
        startingAngle = this.projectileAngle - (numProjectiles / 2 * this.spreadMod) + (this.spreadMod / 2)
      }
      for (let i = 0; i < numProjectiles; i++) {
        this.fireProjectiles(startingAngle + i * this.spreadMod, 1, xpos, ypos)
      }
    }
  }

  respawn(map) {
    this.score = 0
    this.maxHp = Player.baseMaxHp
    this.currentHp = this.maxHp
    this.baseSpeed = Player.baseSpeed
    this.rateOfFire = Player.baseRateOfFire
    this.map = map || Player.defaultMap
    this.scoreValue = Player.baseScoreValue
    this.numProjectiles = 1
    this.rangedDamage = Player.baseRangedDamage
    this.speedPenalty = Player.baseSpeedPenalty
    this.speed = Player.baseSpeed
    this.randomSpawn(0, 0, Map.list[this.map].width, Map.list[this.map].height)
  }

  updateStats(scoreValue) {
    this.score += scoreValue
    const oldMaxHp = this.maxHp
    // stats increment every 3 player kills
    const mod3 = Math.floor(this.score / (Player.baseScoreValue * 3))
    this.scoreValue = Player.baseScoreValue + (Player.baseScoreValue * mod3)
    // Approximately +10% max hp increase per kill, up to a maximum of +200%
    this.maxHp = Math.min(Player.baseMaxHp * 3, Player.baseMaxHp + Math.floor(Player.baseMaxHp * 0.30 * mod3))
    // Player dps increases by +20% of base damage per projectile, if all projectiles hit
    // But spread increases with each projectile
    this.numProjectiles = Math.min(1 + mod3, 21)
    this.rangedDamage = Math.min(Player.baseRangedDamage * 5, Math.floor(Player.baseRangedDamage + Player.baseRangedDamage * 0.2 * (this.numProjectiles - 1)))
    // heal by difference between old max hp and increased max hp
    this.currentHp += this.maxHp - oldMaxHp
  }
}
// Class-level value properties
// NOTE: enemy stats scale to player stats
Player.list = {}
Player.socketList = {}
Player.baseMaxHp = 100
Player.baseRangedDamage = 40
Player.baseSpeed = 20
Player.baseSpeedPenalty = 0.60
Player.baseRateOfFire = 300
Player.baseScoreValue = 20
Player.baseSpreadMod = 2
Player.defaultMap = 'forest'

class Enemy extends Entity {
  constructor(params) {
    super(params)
    this.id = Math.floor(Math.random() * 5000)
    this.allowedToFire = params.allowedToFire
    this.rateOfFire = params.rateOfFire
    this.maxHp = params.maxHp
    this.currentHp = params.currentHp || this.maxHp
    this.spriteCalc = params.spriteCalc
    this.projectileAngle = 0
    this.meleeDamage = params.meleeDamage
    this.rangedDamage = params.rangedDamage
    this.map = params.map
    this.name = params.name || null
    this.type = 'enemy'
    this.xpos = params.xpos
    this.ypos = params.ypos
    this.speed = params.speed
    this.angle = Math.floor(Math.random() * 360)
    this.dx = Math.floor(Math.cos(this.angle / 180 * Math.PI) * this.speed)
    this.dy = Math.floor(Math.sin(this.angle / 180 * Math.PI) * this.speed)
    this.mapWidth = params.mapWidth
    this.mapHeight = params.mapHeight
    this.scoreValue = params.scoreValue
    if (this.x === undefined || this.y === undefined) {
      this.randomSpawn(this.xpos, this.ypos, this.mapWidth, this.mapHeight)
    }
    this.maxNumber = params.maxNumber || 1
    this.respawnTimer = params.respawnTimer
    this.imgSrc = params.imgSrc
    Enemy.list[this.id] = this
    initData.enemies.push(this.initialData)
  }

  static updateAll() {
    for (let i in Enemy.list) {
      let enemy = Enemy.list[i]
      enemy.update()
    }
  }

  static getAllInitData() {
    const enemies = []
    for (let i in Enemy.list) { enemies.push(Enemy.list[i].initialData) }
    return enemies
  }

  static generateEnemies() {
    for (let i = 0; i < Enemy.bat.maxNumber; i++) {
      new Enemy(Enemy.bat)
    }
    for (let i = 0; i < Enemy.beeWest.maxNumber; i++) {
      new Enemy(Enemy.beeWest)
    }
    for (let i = 0; i < Enemy.beeEast.maxNumber; i++) {
      new Enemy(Enemy.beeEast)
    }
    for (let i = 0; i < Enemy.harpySouth.maxNumber; i++) {
      new Enemy(Enemy.harpySouth)
    }
    for (let i = 0; i < Enemy.harpySouthEast.maxNumber; i++) {
      new Enemy(Enemy.harpySouthEast)
    }
    new Enemy(Enemy.hydra)
    new Enemy(Enemy.houseBoss)
  }

  static updateEnemyLocations() {
    for (let i in Enemy.list) {
      const newEnemyData = Enemy.list[i].updateData
      if (newEnemyData !== null) {
        updateData.enemies.push(newEnemyData)
      }
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
      dx: this.dx,
      dy: this.dy,
      xpos: this.xpos,
      ypos: this.ypos,
      mapWidth: this.mapWidth,
      mapHeight: this.mapHeight,
      speed: this.speed,
      name: this.name,
      imgSrc: this.imgSrc
    }
  }

  get updateData() {
    let data = { id: this.id }
    if (this.speed > 0) {
      data.x = this.x
      data.y = this.y
      return data
    }
    // use this conditional for enemies with regenerating health
    if (this.name === Enemy.hydra.name) {
      data.currentHp = this.currentHp
      return data
    }
    return null
  }

  get UIData() {
    return {
      id: this.id,
      name: this.name
    }
  }

  get respawnData() {
    return {
      id: this.id,
      currentHp: this.currentHp,
      dx: this.dx,
      dy: this.dy
    }
  }

  update() {
    this.updateVelocity()
    super.update()
    // this.spriteCalc += 0.25
    if (this.currentHp > 0) {
      if (this.meleeDamage !== null) {
        let entityEliminated = false
        for (let i in Player.list) {
          const target = Player.list[i]
          if (this.isCollision(target, 30) && this.map === target.map) {
            target.currentHp -= this.meleeDamage
            if (target.currentHp <= 0) {
              target.respawn()
              entityEliminated = true
            }
            let data = { players: [target.respawnData] }
            for (let i in Player.socketList) {
              let socket = Player.socketList[i]
              socket.emit('update', BISON.encode(data))
              if (entityEliminated) {
                socket.emit('elimination', BISON.encode({ attacker: this.UIData, target: target.UIData }))
              }
            }
          }
        }
      }
      if (this.rangedDamage !== null) {
        if (this.allowedToFire === true) {
          this.angle = Math.floor(Math.random() * 360)
          if (this.name === Enemy.hydra.name) {
            for (let i = 0; i < 15; i++) {
              this.fireProjectile(this.angle + i * 10, 18, 36)
            }
          } else if (this.name === Enemy.houseBoss.name) {
            for (let i = 0; i < 10; i++) {
              this.fireProjectile(this.angle + i * 5, 20, 32)
            }
          } else if (this.name === Enemy.harpySouth.name || this.name === Enemy.harpySouthEast.name) {
            this.fireProjectile(this.angle, 36, 18)
          }
          this.allowedToFire = false
          setTimeout(() => { this.allowedToFire = true }, this.rateOfFire)
        }
      }
    }
  }

  updateVelocity() {
    if (this.speed !== 0) {
      if (this.x + this.dx > (this.xpos + this.mapWidth) || this.x + this.dx < this.xpos) {
        this.dx = -this.dx
      }
      if (this.y + this.dy > (this.ypos + this.mapHeight) || this.y + this.dy < this.ypos) {
        this.dy = -this.dy
      }
    }
  }

  respawn() {
    const prevSpeed = this.speed
    const angle = Math.floor(Math.random() * 360)
    const newdx = Math.floor(Math.cos(angle / 180 * Math.PI) * this.speed)
    const newdy = Math.floor(Math.sin(angle / 180 * Math.PI) * this.speed)
    this.speed = 0
    this.dx = 0
    this.dy = 0
    setTimeout(() => {
      this.currentHp = this.maxHp
      this.angle = angle
      this.speed = prevSpeed
      this.dx = newdx
      this.dy = newdy
      if (this.name !== Enemy.hydra.name) {
        this.randomSpawn(this.xpos, this.ypos, this.mapWidth, this.mapHeight)
      }
      let data = {
        enemies: [{
          id: this.id,
          currentHp: this.currentHp,
          x: this.x,
          y: this.y,
          dx: this.dx,
          dy: this.dy
        }]
      }
      for (let i in Player.socketList) {
        let socket = Player.socketList[i]
        socket.emit('update', BISON.encode(data))
      }
    }, this.respawnTimer)
  }

  fireProjectile(angle, speed, duration) {
    const projectile = new Projectile({
      source: this.id,
      angle: angle,
      speed: speed,
      duration: duration,
      x: this.x,
      y: this.y,
      map: this.map
    })
    projectile.x = this.x
    projectile.y = this.y
  }
}
// Class-level value properties
Enemy.list = {}
Enemy.bat = {
  scoreValue: Math.floor(Player.baseScoreValue * 3 / 5),
  maxHp: Player.baseMaxHp,
  meleeDamage: Player.baseRangedDamage,
  rangedDamage: null,
  allowedToFire: null,
  rateOfFire: null,
  speed: Math.floor(Player.baseSpeed * 1.1),
  spriteCalc: 0,
  map: 'cave',
  name: 'Bat',
  maxNumber: 8,
  xpos: 0,
  ypos: 0,
  mapWidth: 950,
  mapHeight: 950,
  respawnTimer: 10000,
  imgSrc: '/client/images/bat.png'
}
Enemy.beeWest = {
  scoreValue: Math.floor(Player.baseScoreValue * 2 / 5),
  maxHp: Player.baseMaxHp,
  meleeDamage: Math.floor(Player.baseRangedDamage / 2),
  rangedDamage: null,
  allowedToFire: null,
  rateOfFire: null,
  speed: Math.floor(Player.baseSpeed * 1.1),
  spriteCalc: 0,
  map: 'forest',
  name: 'Bee',
  maxNumber: 6,
  xpos: 0,
  ypos: 0,
  respawnTimer: 10000,
  mapWidth: 1225,
  mapHeight: 1000,
  imgSrc: '/client/images/bee.png'
}
Enemy.beeEast = {
  scoreValue: Math.floor(Player.baseScoreValue * 2 / 5),
  maxHp: Player.baseMaxHp,
  meleeDamage: Math.floor(Player.baseRangedDamage / 2),
  rangedDamage: null,
  allowedToFire: null,
  rateOfFire: null,
  speed: Player.baseSpeed,
  spriteCalc: 0,
  map: 'forest',
  name: 'Bee',
  maxNumber: 6,
  xpos: 1225,
  ypos: 0,
  respawnTimer: 10000,
  mapWidth: 1225,
  mapHeight: 800,
  imgSrc: '/client/images/bee.png'
}
Enemy.harpySouth = {
  scoreValue: Math.floor(Player.baseScoreValue * 3 / 4),
  maxHp: Math.floor(Player.baseMaxHp * 1.5),
  meleeDamage: Player.baseRangedDamage,
  rangedDamage: Player.baseRangedDamage * 2,
  allowedToFire: true,
  rateOfFire: Player.baseRateOfFire * 3,
  speed: Math.floor(Player.baseSpeed / 1.8),
  spriteCalc: 0,
  map: 'forest',
  name: 'Harpy',
  maxNumber: 2,
  xpos: 850,
  ypos: 1900,
  mapWidth: 500,
  mapHeight: 300,
  respawnTimer: 30000,
  imgSrc: '/client/images/harpy.png'
}
Enemy.harpySouthEast = {
  scoreValue: Math.floor(Player.baseScoreValue * 3 / 4),
  maxHp: Math.floor(Player.baseMaxHp * 1.5),
  meleeDamage: Player.baseRangedDamage,
  rangedDamage: Player.baseRangedDamage * 2,
  allowedToFire: true,
  rateOfFire: Player.baseRateOfFire * 3,
  speed: Math.floor(Player.baseSpeed / 1.8),
  spriteCalc: 0,
  map: 'forest',
  name: 'Harpy',
  maxNumber: 2,
  xpos: 2150,
  ypos: 1850,
  mapWidth: 400,
  mapHeight: 300,
  respawnTimer: 30000,
  imgSrc: '/client/images/harpy.png'
}
Enemy.hydra = {
  scoreValue: Player.baseScoreValue * 5,
  maxHp: Player.baseMaxHp * 50,
  meleeDamage: null,
  rangedDamage: Math.floor(Player.baseRangedDamage * 1.5),
  allowedToFire: true,
  rateOfFire: Player.baseRateOfFire * 6,
  speed: 0,
  dx: 0,
  dy: 0,
  spriteCalc: 0,
  map: 'forest',
  name: 'Hydra',
  x: 630,
  y: 1410,
  maxNumber: 1,
  xpos: 630,
  ypos: 1410,
  mapWidth: 2550,
  mapHeight: 2550,
  respawnTimer: 45000,
  imgSrc: '/client/images/waterDragon.png'
}
Enemy.houseBoss = {
  scoreValue: Player.baseScoreValue * 5,
  maxHp: Player.baseMaxHp * 25,
  meleeDamage: Player.baseRangedDamage * 2,
  rangedDamage: Player.baseRangedDamage * 2,
  allowedToFire: true,
  rateOfFire: Player.baseRateOfFire * 3,
  speed: Math.floor(Player.baseSpeed * 0.8),
  spriteCalc: 0,
  map: 'house',
  name: 'Joel',
  maxNumber: 1,
  xpos: 230,
  ypos: 200,
  mapWidth: 400,
  mapHeight: 400,
  respawnTimer: 45000,
  imgSrc: '/client/images/joel.png'
}

//---------------------------------------------PROJECTILES----------------------------------------------//

class Projectile extends Entity {
  constructor(params) {
    super(params)
    // source: the id of the entity that fired this projectile
    this.source = params.source
    this.id = Math.floor(Math.random() * 1000)
    this.map = params.map
    this.angle = params.angle
    this.duration = params.duration || 8
    this.speed = params.speed || 80
    this.damage = 10
    this.dx = Math.floor(Math.cos(params.angle / 180 * Math.PI) * this.speed)
    this.dy = Math.floor(Math.sin(params.angle / 180 * Math.PI) * this.speed)
    this.timer = 0
    Projectile.list[this.id] = this
    initData.projectiles.push(this.initRenderData)
  }

  static updateAll() {

    for (let i in Projectile.list) {
      let projectile = Projectile.list[i]
      projectile.update()
      let projPos = Map.list[projectile.map].isPositionWall(projectile)
      if (projPos && projPos === 436 || projPos === 35) {
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
      angle: this.angle,
      speed: this.speed
    }
  }

  get updateRenderData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y
    }
  }
  // Queue projectile for removal when timer exceeds duration
  // Projectile deleted as soon as it hits something (no splash damage)
  // Take out return statements in for loop to allow splash, but this will cost a lot more performance issues
  update() {
    if (this.timer++ > this.duration) {
      delete Projectile.list[this.id]
      removeData.projectiles.push(this.id)
      return
    }
    super.update()
    let entityEliminated = false
    let attacker = Player.list[this.source]
    if (!attacker) {
      attacker = Enemy.list[this.source]
    }
    if (attacker !== undefined) {
      // Check projectile collision with players
      for (let i in Player.list) {
        const target = Player.list[i]
        if (this.map === target.map && this.isCollision(target, 40) && this.source !== target.id) {
          target.currentHp -= attacker.rangedDamage
          if (target.currentHp <= 0) {
            if (attacker.type === 'player') {
              attacker.updateStats(target.scoreValue)
            }
            if (attacker.type === 'enemy' && attacker.name === (Enemy.hydra.name || Enemy.houseBoss.name)) {
              // Boss heals up to 5% of its health when it kills someone
              attacker.currentHp += Math.min(attacker.maxHp - attacker.currentHp, Math.floor(attacker.maxHp * 0.05))
            }
            target.respawn()
            entityEliminated = true
          }
          let data = { players: [target.respawnData] }
          for (let id in Player.socketList) {
            let socket = Player.socketList[id]
            socket.emit('update', BISON.encode(data))
            if (entityEliminated) {
              socket.emit('elimination', BISON.encode({ attacker: attacker.UIData, target: target.UIData }))
            }
          }
          delete Projectile.list[this.id]
          removeData.projectiles.push(this.id)
          return
        }
      }
      // Check projectile collision with enemies
      if (attacker.type === 'player') {
        for (let i in Enemy.list) {
          const target = Enemy.list[i]
          if (this.map === target.map && this.isCollision(target, 50) && target.currentHp > 0) {
            target.currentHp -= attacker.rangedDamage
            if (target.currentHp <= 0) {

              attacker.updateStats(target.scoreValue)
              if (target.name === Enemy.hydra.name) {
                attacker.rateOfFire = Math.floor(0.50 * Player.baseRateOfFire)
                setTimeout(() => { attacker.rateOfFire = Math.floor(Player.baseRateOfFire) }, 20000)
              } else if (target.name === Enemy.houseBoss.name) {
                attacker.speedPenalty = 1.0
                attacker.speed = Player.baseSpeed * 1.5
                setTimeout(() => {
                  attacker.speedPenalty = Player.baseSpeedPenalty
                  attacker.speed = Player.baseSpeed
                }, 20000)
              }

              entityEliminated = true
              target.respawn()
            }
            let data = { enemies: [target.respawnData] }
            for (let i in Player.socketList) {
              let socket = Player.socketList[i]
              socket.emit('update', BISON.encode(data))
              if (entityEliminated) {
                socket.emit('elimination', BISON.encode({ attacker: attacker.UIData, target: target.UIData }))
              }
            }
            delete Projectile.list[this.id]
            removeData.projectiles.push(this.id)
            return
          }
        }
      }
      // Projectile source undefined, projectile deleted immediately
    } else {
      delete Projectile.list[this.id]
      removeData.projectiles.push(this.id)
      return
    }
  }
}

// Class-level value properties
Projectile.list = {}

class Upgrade extends Entity {
  constructor(params) {
    super(params)
    this.id = Math.floor(Math.random() * 5000)
    this.map = params.map
    this.name = params.name
    this.type = 'upgrade'
    this.x = params.x
    this.y = params.y
    this.xpos = params.xpos
    this.ypos = params.ypos
    this.mapWidth = params.mapWidth
    this.mapHeight = params.mapHeight
    this.imgSrc = params.imgSrc
    this.heal = params.heal
    this.used = false
    Upgrade.list[this.id] = this
    initData.upgrades.push(this.initialData)
  }

  // static updateAll() {
  //   for (let i in Upgrade.list) {
  //     let upgrade = Upgrade.list[i]
  //     upgrade.update()
  //   }
  // }

  static getAllInitData() {
    const upgrades = []
    for (let i in Upgrade.list) { upgrades.push(Upgrade.list[i].initialData) }
    return upgrades
  }

  static generatePowerUps() {
    new Upgrade(Upgrade.potionCave)
    new Upgrade(Upgrade.potionOutdoors1)
    new Upgrade(Upgrade.potionOutdoors2)
    new Upgrade(Upgrade.potionOutdoors1PvP)
    new Upgrade(Upgrade.potionOutdoors2PvP)
  }

  get initialData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      map: this.map,
      xpos: this.xpos,
      ypos: this.ypos,
      mapWidth: this.mapWidth,
      mapHeight: this.mapHeight,
      name: this.name,
      heal: this.heal,
      imgSrc: this.imgSrc,
      used: this.used
    }
  }

  restore() {
    setTimeout(() => {
      this.used = false
      // this.randomSpawn(this.xpos, this.ypos, this.mapWidth, this.mapHeight)
      let data = { upgrades: [{ id: this.id, used: this.used }] }
      for (let i in Player.socketList) {
        let socket = Player.socketList[i]
        socket.emit('update', BISON.encode(data))
      }
    }, 40000)
  }
  sendUsedUpgrade(target) {
    this.used = true
    target.currentHp += Math.min(this.heal, target.maxHp - target.currentHp)
    let data = {
      upgrades: [{ id: this.id, used: this.used }],
      players: [{ id: target.id, currentHp: target.currentHp }]
    }
    for (let i in Player.socketList) {
      let socket = Player.socketList[i]
      socket.emit('update', BISON.encode(data))
    }
  }
}

Upgrade.list = {}
Upgrade.potionCave = {
  map: 'cave',
  x: 120,
  y: 120,
  name: 'potion',
  heal: Player.baseMaxHp,
  xpos: 0,
  ypos: 0,
  mapWidth: 950,
  mapHeight: 950,
  imgSrc: '/client/images/bigHealthPotion.png'
}
Upgrade.potionOutdoors1 = {
  map: 'forest',
  x: 130,
  y: 2210,
  name: 'potion',
  heal: Math.min(Player.baseMaxHp / 3),
  xpos: 0,
  ypos: 0,
  mapWidth: 950,
  mapHeight: 950,
  imgSrc: '/client/images/smallHealthPotion.png'
}
Upgrade.potionOutdoors2 = {
  map: 'forest',
  x: 2520,
  y: 2310,
  name: 'potion',
  heal: Math.min(Player.baseMaxHp / 3),
  xpos: 0,
  ypos: 0,
  mapWidth: 950,
  mapHeight: 950,
  imgSrc: '/client/images/smallHealthPotion.png'
}
Upgrade.potionOutdoors1PvP = {
  map: 'pvp-forest',
  x: 130,
  y: 2210,
  name: 'potion',
  heal: Math.min(Player.baseMaxHp / 3),
  xpos: 0,
  ypos: 0,
  mapWidth: 950,
  mapHeight: 950,
  imgSrc: '/client/images/smallHealthPotion.png'
}
Upgrade.potionOutdoors2PvP = {
  map: 'pvp-forest',
  x: 2520,
  y: 2310,
  name: 'potion',
  heal: Math.min(Player.baseMaxHp / 3),
  xpos: 0,
  ypos: 0,
  mapWidth: 950,
  mapHeight: 950,
  imgSrc: '/client/images/smallHealthPotion.png'
}


module.exports = {
  "SOCKET_LIST": Player.socketList,
  "playerConnect": Player.onConnect,
  "playerDisconnect": Player.onDisconnect,
  "generateEnemies": Enemy.generateEnemies,
  "getFrameUpdateData": Entity.getFrameUpdateData,
  "updateEnemyLocations": Enemy.updateEnemyLocations,
  "generateMaps": Map.generateMaps,
  "generatePowerUps": Upgrade.generatePowerUps
}