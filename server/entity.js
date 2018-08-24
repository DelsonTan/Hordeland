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
}

module.exports = Entity