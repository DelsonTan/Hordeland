const Entity = require('./entity.js')

class Player extends Entity {

    constructor(id) {
        super(id)
        this.number = (Math.floor(10 * Math.random())).toString()
        this.pressingLeft = false
        this.pressingRight = false
        this.pressingUp = false
        this.pressingDown = false
        this.maxSpeed = 10
    }

    // Instance level method to update the player position and velocity
    update() {
        this.updateSpeed()
        super.update()
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