// const { PlayerList, PlayerSocketList } = require('./entity.js')
// class Enemy {
//   constructor(params) {
//     super(params)
//     this.id = (Math.floor(100 * Math.random())).toString()
//     this.allowedToFire = true
//     this.rateOfFire = 100
//     this.speed = Enemy.maxSpeed
//     this.currentHp = 5
//     this.maxHp = 5
//     this.spriteCalc = 0
//     this.projectileAngle = 0
//     this.map = 'field' || params.map
//     this.name = 'bats'
//     this.type = 'enemy'
//     this.x = Math.floor(Math.random() * 3000)
//     this.y = Math.floor(Math.random() * 3000)
//     Enemy.list[this.id] = this
//     initData.enemies.push(this.initialData)
//   }


//   static updateAll() {
//     const data = []
//     for (let i in Enemy.list) {
//       let enemy = Enemy.list[i]
//       enemy.update()
//       let projPos = Map.list[enemy.map].isPositionWall(enemy)
//       // if (projPos && projPos === 468) {
//       //   projectile.toRemove = true
//       // }
//       data.push(enemy.updateData)
//     }
//     return data
//   }

//   static getAllInitData() {
//     const enemies = []
//     for (let i in Enemy.list) { enemies.push(Enemy.list[i].initialData) }
//     return enemies
//   }

//   get initialData() {
//     return {
//       id: this.id,
//       x: this.x,
//       y: this.y,
//       currentHp: this.currentHp,
//       maxHp: this.maxHp,
//       map: this.map,
//       spriteCalc: this.spriteCalc,
//     }
//   }

//   get updateData() {
//     return {
//       id: this.id,
//       x: this.x,
//       y: this.y,
//       currentHp: this.currentHp,
//       map: this.map,
//       spriteCalc: this.spriteCalc,
//     }
//   }

//   get UIData() {
//     return {
//       id: this.id,
//       name: this.name,
//       score: this.score
//     }
//   }

//   update() {
//     const prevX = this.x
//     const prevY = this.y
//     this.updateSpeed()
//     super.update()

//     this.spriteCalc += 0.25
//     if (this.name !== 'bats' && Map.list[this.map].isPositionWall(this)) {
//       this.x = prevX
//       this.y = prevY
//     }
//     for (let i in PlayerList) {
//       const target = PlayerList[i]
//       if (this.testCollision(target)) {
//         target.currentHp -= 1
//         if (target.currentHp <= 0) {
//           target.currentHp = target.maxHp
//           target.score -= 1
//           target.x = Math.floor(Map.list[target.map].width / 10)
//           target.y = Math.floor(Map.list[target.map].height / 2)
//         }
//         for (let i in PlayerSocketList) {

//           let socket = PlayerSocketList[i]
//           let data = {
//             players: [{
//               id: target.id,
//               currentHp: target.currentHp,
//               x: target.x,
//               y: target.y
//             }]
//           }
//           socket.emit('update', BISON.encode(data))
//         }
//       }
//     }

//     // if (this.allowedToFire && this.pressingFire) {
//     //   this.fireProjectile(this.projectileAngle)
//     //   this.allowedToFire = false
//     //   setTimeout(() => { this.allowedToFire = true }, this.rateOfFire)
//     // }
//   }


//   updateSpeed() {
//     if (this.pressingLeft) { this.dx = -this.speed } else if (this.pressingRight) { this.dx = this.speed } else { this.dx = 0 }

//     if (this.pressingUp) { this.dy = -this.speed } else if (this.pressingDown) { this.dy = this.speed } else { this.dy = 0 }
//   }

//   // fireProjectile(angle) {
//   //   const projectile = new Projectile({
//   //     source: this.type,
//   //     angle: angle,
//   //     x: this.x,
//   //     y: this.y,
//   //     map: this.map
//   //   })
//   //   projectile.x = this.x
//   //   projectile.y = this.y
//   // }
// }
// // Class-level value property: list of all current players
// Enemy.list = {}
// Enemy.maxSpeed = 8
// new Enemy({ name: 'field', imgSrc: '/client/images/map1.png', grid: array2D })

// module.exports = Enemy