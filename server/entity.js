const initData = { players: [], projectiles: [] }
const removeData = {players: [], projectiles: [] }

class Entity {
    constructor(id) {
        this.id = id
        this.x = 250
        this.y = 250
        this.dx = 0
        this.dy = 0
    }

    update() {
        this.updatePosition()
    }

    updatePosition() {
        this.x += this.dx
        this.y += this.dy
    }
    // point object must have x and y properties specifying its coordinates in pixels 
    getDistance(point) {
        // Pythagoras!
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2))
    }
}

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
        if (this.pressingLeft) { this.dx = -this.maxSpeed }
        else if (this.pressingRight) { this.dx = this.maxSpeed }
        else { this.dx = 0 }

        if (this.pressingUp) { this.dy = -this.maxSpeed }
        else if (this.pressingDown) { this.dy = this.maxSpeed }
        else { this.dy = 0 }
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
            if (data.inputId === 'left') { player.pressingLeft = data.state }
            else if (data.inputId === 'right') { player.pressingRight = data.state }
            else if (data.inputId === 'up') { player.pressingUp = data.state }
            else if (data.inputId === 'down') { player.pressingDown = data.state }
            else if (data.inputId === 'leftClick') { player.pressingFire = data.state }
            else if (data.inputId === 'mouseAngle') { player.mouseAngle = data.state }
        })
    }

    static onDisconnect(socket) { delete Player.list[socket.id] }

    static update() {
        const data = []
        for (let i in Player.list) {
            let player = Player.list[i]
            player.update()
            data.push({
                id: player.id,
                x: player.x,
                y: player.y,
                number: player.number
            })
        }
        return data
    }
}
// Class-level value property: list of players
Player.list = {}

class Projectile extends Entity {
    // Adds projectile to Projectile.list upon instantiation
    constructor(source, angle) {
        super()
        // source: the id of the entity that fired this projectile
        this.source = source
        this.id = Math.random()
        this.dx = Math.cos(angle / 180 * Math.PI) * 10
        this.dy = Math.sin(angle / 180 * Math.PI) * 10
        this.timer = 0
        this.toRemove = false
        Projectile.list[this.id] = this
    }

    static update() {
        const pack = []
        for (let i in Projectile.list) {
            let projectile = Projectile.list[i]
            projectile.update()
            if (projectile.toRemove) {
                delete Projectile.list[i]
            } else {
                pack.push({
                    id: projectile.id,
                    x: projectile.x,
                    y: projectile.y,
                })
            }
        }
        return pack
    }
    // Queue projectile for removal when timer exceeds 100
    update() {
        if (this.timer++ > 100) { this.toRemove = true }
        super.update()
        for (let i in Player.list) {
            const player = Player.list[i]
            if (this.getDistance(player) < 20 && this.source !== player.id) {
                this.toRemove = true
                // TODO: handle collision, e.g. subtract hp
            }
        }
    }
}
// Class-level value property: list of projectiles
Projectile.list = {}

module.exports = { Player, Projectile }