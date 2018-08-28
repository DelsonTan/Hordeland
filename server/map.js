class Map {
    constructor(params) {
        this.name = params.name
        this.imgSrc = params.imgSrc
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
    
}
// Map Choices
Map.list = {}
new Map({ name: 'field', imgSrc: '/client/images/map.png' })
new Map({ name: 'forest', imgSrc: '/client/images/map2.png' })

module.exports = Map