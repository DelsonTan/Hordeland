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

module.exports = Entity