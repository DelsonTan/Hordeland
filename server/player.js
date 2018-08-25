const Entity = require('./entity.js')
const Projectile = require('./projectile.js')

class Player extends Entity {

    constructor(id) {
        super(id)
        this.number = (Math.floor(10 * Math.random())).toString()
        this.pressingLeft = false
        this.pressingRight = false
        this.pressingUp = false
        this.pressingDown = false
        this.pressingFire = false
        this.mouseAngle = 0
        this.maxSpeed = 10
    }
    // Instance level method to update the player position and velocity
    update() {
        this.updateSpeed()
        super.update()

        if (this.pressingFire) {
            this.fireProjectile(this.mouseAngle)
        }
    }

    updateSpeed() {
        if (this.pressingLeft) {
            this.dx = -this.maxSpeed
        } else if (this.pressingRight) {
            this.dx = this.maxSpeed
        } else {
            this.dx = 0
        }
        if (this.pressingUp) {
            this.dy = -this.maxSpeed
        } else if (this.pressingDown) {
            this.dy = this.maxSpeed
        } else {
            this.dy = 0
        }
    }

    fireProjectile(angle) {
        const projectile = new Projectile(this.id, angle)
        projectile.x = this.x
        projectile.y = this.y
    }

    static onConnect(socket) {
        const player = new Player(socket.id)
        Player.list[socket.id] = player

        socket.on('keyPress', (data) => {
            if (data.inputId === 'left') {
                player.pressingLeft = data.state
            } else if (data.inputId === 'right') {
                player.pressingRight = data.state
            } else if (data.inputId === 'up') {
                player.pressingUp = data.state
            } else if (data.inputId === 'down') {
                player.pressingDown = data.state
            } else if (data.inputId === 'leftClick') {
                player.pressingFire = data.state
            } else if (data.inputId === 'mouseAngle') {
                player.mouseAngle = data.state
            }
        })
    }

    static onDisconnect(socket) {
        delete Player.list[socket.id]
    }

    static update() {
        const pack = []
        for (let i in Player.list) {
            let player = Player.list[i]
            player.update()
            pack.push({
                x: player.x,
                y: player.y,
                number: player.number
            })
        }
        return pack
    }
}
// Class-level value property: list of players
Player.list = {}

module.exports = Player