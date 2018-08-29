class Map {
    constructor(params) {
        this.name = params.name
        this.imgSrc = params.imgSrc
        this.grid = params.grid
        this.width = 800 * 4
        this.height = 800 * 4
        Map.list[this.name] = this
    }

    static getAllInitData() {
        const maps = []
        for (let i in Map.list) { maps.push(Map.list[i].initialData) }
        return maps
    }

    get initialData() {
        return {
            name: this.name,
            imgSrc: this.imgSrc
        }
    }

    isPositionWall(player) {
        return (player.x > this.width ||
            player.x < 0 ||
            player.y > this.height ||
            player.y < 0)
    }
}
// Map Choices
Map.list = {}
Map.tileSize = 32
new Map({ name: 'field', imgSrc: '/client/images/map.png', grid: [] })
new Map({ name: 'forest', imgSrc: '/client/images/map2.png', grid: [] })

module.exports = Map