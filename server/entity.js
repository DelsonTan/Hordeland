const Map = require('./map.js')
// const Enemies = require('./enemies.js')
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
  testCollision(point) {
    let distance = this.getDistance(point)
    return distance < 10;
  }

  static getFrameUpdateData() {
    const updateData = {
      players: Player.updateAll(),
      projectiles: Projectile.updateAll(),
      enemies: Enemy.updateAll()
    }
    const data = {
      init: {},
      update: {},
      remove: {}

    }
    if (initData.players.length > 0) {
      data.init.players = initData.players
    }
    if (initData.enemies && initData.enemies.length > 0) {
      data.init.enemies = initData.enemies
    }
    if (initData.projectiles.length > 0) {
      data.init.projectiles = initData.projectiles
    }
    if (updateData.players.length > 0) {
      data.update.players = updateData.players
    }
    if (updateData.projectiles.length > 0) {
      data.update.projectiles = updateData.projectiles
    }
    if (updateData.enemies.length > 0) {
      data.update.enemies = updateData.enemies
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
    initData.enemies = []
    removeData.players = []
    removeData.projectiles = []
    removeData.enemies = []
    return data
  }
}

class Player extends Entity {
  constructor(params) {
    super(params)
    this.number = (Math.floor(10 * Math.random())).toString()
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
    Player.list[this.id] = this
    initData.players.push(this.initialData)
  }

  static onConnect(socket) {
    const player = new Player({
      id: socket.id,
      map: 'field',
      name: socket.playerName
    })


    socket.on('keyPress', (data) => {
      if (data.inputId === 'leftClick') {
        if (data.state) {
          player.speed = Math.floor(Player.maxSpeed * 0.60)
        } else {
          player.speed = Math.floor(Player.maxSpeed)
        }
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
      players: Player.getAllInitData(),
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
        data.push(player.updateData)
      }
    }
    return data
  }

  static onDisconnect(socket) {
    delete Player.list[socket.id]
    removeData.players.push(socket.id)
  }

  static getAllInitData() {
    const players = []
    for (let i in Player.list) { players.push(Player.list[i].initialData) }
    return players
  }

  static getAllInitUIData() {
    const players = []
    for (let i in Player.list) { players.push(Player.list[i].UIData) }
    return players
  }

  get initialData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      currentHp: this.currentHp,
      maxHp: this.maxHp,
      score: this.score,
      number: this.number,
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

  get updateData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      currentHp: this.currentHp,
      score: this.score,
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
// Class-level value property: list of all current players
Player.list = {}
Player.socketList = {}
Player.maxSpeed = 20

//------------------------------------------------ENEMIES--------------------------------------------------//

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
    this.map = 'field' || params.map
    this.name = 'bats'
    this.type = 'enemy'
    this.x = Math.floor(Math.random() * 3000)
    this.y = Math.floor(Math.random() * 3000)
    this.target = ''
    Enemy.list[this.id] = this
    initData.enemies.push(this.initialData)
  }


  static updateAll() {
    const data = []
    for (let i in Enemy.list) {
      let enemy = Enemy.list[i]
      enemy.update()
      // let projPos = Map.list[enemy.map].isPositionWall(enemy)
      // if (projPos && projPos === 468) {
      //   projectile.toRemove = true
      // }
      data.push(enemy.updateData)
    }
    return data
  }

  static getAllInitData() {
    const enemies = []
    for (let i in Enemy.list) { enemies.push(Enemy.list[i].initialData) }
    return enemies
  }

  static generateEnemies(id) {
    new Enemy(id);
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

  get updateData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      currentHp: this.currentHp,
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
    const prevX = this.x
    const prevY = this.y
    this.updateSpeed()
    super.update()

    // this.spriteCalc += 0.25
    // if (Map.list[this.map].isPositionWall(this)) {
    //   this.x = prevX
    //   this.y = prevY
    // }
    for (let i in Player.list) {
      const target = Player.list[i]
      if (this.testCollision(target)) {
        target.currentHp -= 1
        if (target.currentHp <= 0) {
          target.currentHp = target.maxHp
          target.score -= 1
          target.x = Math.floor(Map.list[target.map].width / 10)
          target.y = Math.floor(Map.list[target.map].height / 2)
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


  updateSpeed() {
    let closestDistance = 5000;
    if (Object.keys(Player.list).length > 0) {

        for (let i in Player.list) {
          let distanceSum = 0;
          let diffX = Math.floor(Player.list[i].x - this.x)
          let diffY = Math.floor(Player.list[i].y - this.y)
          distanceSum = diffX + diffY;
          if (closestDistance > distanceSum) {
            closestDistance = distanceSum;
            this.target = Player.list[i]
          }
        }

      console.log(this.target)

      if (Math.floor(this.target.x - this.x) > 4) {
        this.x += 3;
      } else if(Math.floor(this.target.x - this.x) < 0) {
        this.x -= 3;
      }

      if (Math.floor(this.target.y - this.y) > 4) {
        this.y += 3;
      } else if(Math.floor(this.target.y - this.y) < 0){
        this.y -= 3;
      }
    } else {
      this.y += 0;
      this.x += 0;
      console.log(this.target)
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
// Class-level value property: list of all current players
Enemy.list = {}
Enemy.maxSpeed = 8

//------------------------------------------------PROJECTILES----------------------------------------------//

class Projectile extends Entity {
  constructor(params) {
    super(params)
    // source: the id of the entity that fired this projectile
    this.source = params.source
    this.id = Math.floor(Math.random() * 1000)
    this.angle = params.angle
    this.speed = 50
    this.dx = Math.floor(Math.cos(params.angle / 180 * Math.PI) * this.speed)
    this.dy = Math.floor(Math.sin(params.angle / 180 * Math.PI) * this.speed)
    this.map = params.map
    this.timer = 0
    this.toRemove = false
    Projectile.list[this.id] = this
    initData.projectiles.push(this.initialData)
  }

  static updateAll() {
    const data = []
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
      } else {
        data.push(projectile.updateData)
      }
    }
    return data
  }

  static getAllInitData() {
    const projectiles = []
    for (let i in Projectile.list) { projectiles.push(Projectile.list[i].initialData) }
    return projectiles
  }

  get initialData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      map: this.map
    }
  }

  get updateData() {
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
      if (this.map === target.map && this.getDistance(target) < 30) {
        target.currentHp -= 1
        if (target.currentHp <= 0) {
          const attacker = Player.list[this.source]
          if (attacker) { attacker.score += 1 }
          target.currentHp = target.maxHp
          target.x = Math.floor(Map.list[target.map].width / 10)
          target.y = Math.floor(Map.list[target.map].height / 2)

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
          socket.emit('remove', BISON.encode(removeData))
        }
      }
    }

    for (let i in Enemy.list) {
      const target = Enemy.list[i]
      if (this.map === target.map && this.getDistance(target) < 30) {
        target.currentHp -= 1
        if (target.currentHp <= 0) {
          const attacker = Player.list[this.source]
          if (attacker) { attacker.score += 1 }
          target.currentHp = target.maxHp
          target.x = Math.floor(Map.list[target.map].width / 10)
          target.y = Math.floor(Map.list[target.map].height / 2)

          this.toRemove = true
          for (let i in Player.socketList) {
            let socket = Player.socketList[i]
            socket.emit('updateScore', BISON.encode({ players: [attacker.UIData, target.UIData] }))
          }
        }
        for (let i in Player.socketList) {

          let socket = Player.socketList[i]
          let data = {
            enemies: [{
              id: target.id,
              currentHp: target.currentHp,
              x: target.x,
              y: target.y
            }]
          }
          socket.emit('update', BISON.encode(data))
          delete Projectile.list[this.id]
          removeData.projectiles.push(this.id)
          socket.emit('remove', BISON.encode(removeData))
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
  "SOCKET_LIST": Player.socketList,
  "generateEnemies": Enemy.generateEnemies,
  "PlayerList": Player.list,
  "PlayerSocketList": Player.socketList,
  "EnemyList": Enemy.list
}