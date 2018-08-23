class Player {
    constructor(id) {
        this.x = 250
        this.y = 250
        this.id = id
        this.number = (Math.floor(10 * Math.random())).toString()
        this.pressingLeft = false
        this.pressingRight = false
        this.pressingUp = false
        this.pressingDown = false
        this.maxSpeed = 10
    }

    updatePosition() {
        if (this.pressingLeft) {
            this.x -= this.maxSpeed
        }
        if (this.pressingRight) {
            this.x += this.maxSpeed
        }
        if (this.pressingUp) {
            this.y -= this.maxSpeed
        }
        if (this.pressingDown) {
            this.y += this.maxSpeed
        }
    }
}

module.exports = Player