const Entity = require('./entity.js')

class Projectile extends Entity {
    // Adds projectile to Projectile.list upon instantiation
    constructor(angle) {
        super()
        this.id = Math.random()
        this.dx = Math.cos(angle / 180 * Math.PI) * 10
        this.dy = Math.sin(angle / 180 * Math.PI) * 10
        this.timer = 0
        this.toRemove = false
        Projectile.list[this.id] = this
    }
    // Queue projectile for removal when timer exceeds 100
    update() {
        if (this.timer++ > 100) {
            this.toRemove = true
        }
        super.update()
    }
    // Remove projectile from Projectile.list when queued for removal
    static update() {
        if (Math.random() < 0.1) {
            new Projectile(Math.random() * 360)
        }
        const pack = []
        for (let i in Projectile.list) {
            let projectile = Projectile.list[i]
            projectile.update()
            if (projectile.toRemove) {
                delete Projectile.list[i]
            } else {
                pack.push({
                    x: projectile.x,
                    y: projectile.y,
                })
            }
        }
        return pack
    }
}
// Class-level value property: list of projectiles
Projectile.list = {}

module.exports = Projectile