const Entity = require('./entity.js')

class Projectile extends Entity {
    constructor() {
        super()
        this.id = Math.random()
        this.dx = Math.cos(angle/180*Math.PI) * 10
        this.dy = Math.sin(angle/180*Math.PI) * 10
        this.timer = 0
        this.toRemove = false
    }

    update() {
        if(this.timer++ > 100) {
            this.toRemove = true
        }
        super.update()
    }
}

module.exports = Projectile