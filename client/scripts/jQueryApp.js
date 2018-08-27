const jQueryApp = function () {
    $(document).ready(function () {
        const socket = io()
        // Canvas Selectors and Settings
        const canvas = $('#ctx')
        canvas.contextmenu(function () { return false })
        canvas[0].width = $(window).width()
        canvas[0].height = $(window).height()
        const ctx = canvas[0].getContext("2d")
        ctx.font = '30px Arial'
        // Chat Selectors and Settings
        const chatText = $('#chat-text')
        const chatInput = $('#chat-input')
        const chatForm = $('#chat-form')
        // Images
        const Img = {}
        Img.player = new Image()
        Img.player.src = '/client/images/player.png'
        Img.bullet = new Image()
        Img.bullet.src = '/client/images/bullet.png'
        Img.map = {}
        Img.map['field'] = new Image()
        Img.map['field'].src = '/client/images/map.png'
        Img.map['forest'] = new Image()
        Img.map['forest'].src = '/client/images/map2.png'
        // ------------------------------------------------ Game Logic ------------------------------------------------
        let selfId = null
        class Player {
            constructor(params) {
                this.id = params.id
                this.number = params.number
                this.x = params.x
                this.y = params.y
                this.currentHp = params.currentHp
                this.maxHp = params.maxHp
                this.score = params.score
                this.map = params.map
                Player.list[this.id] = this
            }

            render() {
                if (Player.list[selfId].map !== this.map) {
                    return
                }
                const xpos = this.x - Player.list[selfId].x + canvas[0].width / 2
                const ypos = this.y - Player.list[selfId].y + canvas[0].height / 2
                const playerSpriteWidth = Img.player.width * 4
                const playerSpriteHeight = Img.player.height * 4
                // hp bar
                const currentHpWidth = 30 * this.currentHp / this.maxHp
                ctx.fillStyle = "darkred"
                ctx.fillRect(xpos - currentHpWidth / 2, ypos - playerSpriteHeight / 2, 30, 4)
                ctx.fillStyle = "darkblue"
                ctx.fillRect(xpos - currentHpWidth / 2, ypos - playerSpriteHeight / 2, currentHpWidth, 4)
                // player sprite
                

                ctx.drawImage(Img.player, 0, 0, Img.player.width, Img.player.height,
                    xpos - playerSpriteWidth / 2, ypos - playerSpriteHeight / 2, playerSpriteWidth, playerSpriteHeight)
            }
        }
        Player.list = {}

        class Projectile {
            constructor(params) {
                this.id = params.id
                this.x = params.x
                this.y = params.y
                this.map = params.map
                Projectile.list[this.id] = this
            }
            render() {
                if (Player.list[selfId].map !== this.map) {
                    return
                }
                const imgWidth = Img.player.width
                const imgHeight = Img.player.height
                const xpos = this.x - Player.list[selfId].x + canvas[0].width / 2
                const ypos = this.y - Player.list[selfId].y + canvas[0].height / 2

                ctx.drawImage(Img.bullet, 0, 0, Img.bullet.width, Img.bullet.height,
                    xpos - imgWidth / 2, ypos - imgHeight / 2, imgWidth, imgHeight)
            }
        }
        Projectile.list = {}

        socket.on('init', function (data) {
            if (data.selfId) { selfId = data.selfId }
            for (let i = 0; i < data.players.length; i++) {
                new Player(data.players[i])
            }
            for (let i = 0; i < data.projectiles.length; i++) {
                new Projectile(data.projectiles[i])
            }
        })

        socket.on('update', function (data) {
            for (let i = 0; i < data.players.length; i++) {
                const newPlayerData = data.players[i]
                const player = Player.list[newPlayerData.id]
                if (player) {
                    if (player.x !== undefined) { player.x = newPlayerData.x }
                    if (player.y !== undefined) { player.y = newPlayerData.y }
                    if (player.currentHp !== undefined) { player.currentHp = newPlayerData.currentHp }
                    if (player.maxHp !== undefined) { player.maxHp = newPlayerData.maxHp }
                    if (player.score !== undefined) { player.score = newPlayerData.score }
                }
            }
            for (let i = 0; i < data.projectiles.length; i++) {
                const newProjectileData = data.projectiles[i]
                const projectile = Projectile.list[newProjectileData.id]
                if (projectile) {
                    if (projectile.x !== undefined) { projectile.x = newProjectileData.x }
                    if (projectile.y !== undefined) { projectile.y = newProjectileData.y }
                }
            }
        })

        socket.on('remove', function (data) {
            for (let i = 0; i < data.players.length; i++) {
                delete Player.list[data.players[i]]
            }
            for (let i = 0; i < data.projectiles.length; i++) {
                delete Projectile.list[data.projectiles[i]]
            }
        })
        // ------------------------------------------------ Event Handlers ------------------------------------------------
        // Helpers for syntactic sugar
        const focusCanvas = () => { canvas.focus() }
        const blurCanvas = () => { canvas.blur() }
        const focusChat = () => { chatInput.focus() }
        const blurChat = () => { chatInput.blur() }
        const pressing = (action, bool) => { socket.emit('keyPress', { inputId: action, state: bool }) }
        // TODO: focus canvas on tabbing into game
        $(window).focus(() => { focusCanvas() })
        $(window).blur(function () { blurCanvas() })
        // TODO: cancel all player actions when tabbing out of the game
        // TODO: make chat scroll to bottom when new messages arrive
        $(window).resize(function () {
            canvas[0].height = $(window).height()
            canvas[0].width = $(window).width()
            canvas[0].height = $(window).height()
        })

        // Cancels all player key press events
        const cancelPlayerKeyPress = function () {
            pressing('left', false)
            pressing('right', false)
            pressing('up', false)
            pressing('down', false)
            pressing('leftClick', false)
        }

        canvas.on("keydown", function (event) {
            if (event.which === 65) { pressing('left', true) }
            else if (event.which === 68) { pressing('right', true) }
            else if (event.which === 87) { pressing('up', true) }
            else if (event.which === 83) { pressing('down', true) }
            else if (event.which === 13) {
                event.preventDefault()
                cancelPlayerKeyPress()
                blurCanvas()
                focusChat()
            }
        })

        canvas.on("keyup", function (event) {
            if (event.which === 65) { pressing('left', false) }
            else if (event.which === 68) { pressing('right', false) }
            else if (event.which === 87) { pressing('up', false) }
            else if (event.which === 83) { pressing('down', false) }
        })

        canvas.mousedown(function (event) { if (event.which === 1) { pressing('leftClick', true) } })
        canvas.mouseup(function (event) { if (event.which === 1) { pressing('leftClick', false) } })

        canvas.mousemove(function (event) {
            const x = -canvas[0].width / 2 + event.clientX - 8
            const y = -canvas[0].height / 2 + event.clientY - 8
            const angle = Math.atan2(y, x) / Math.PI * 180
            socket.emit('keyPress', { inputId: 'mouseAngle', state: angle })
        })
        // Chat
        chatForm.submit(function (event) {
            event.preventDefault()
            if (chatInput.val()[0] === '/') { socket.emit('evalMessage', { text: chatInput.val().slice(1) }) }
            else { socket.emit('sendMessage', { text: chatInput.val() }) }
            chatInput.val("")
            blurChat()
            focusCanvas()
        })

        socket.on('addToChat', function (data) { $("<div>").text(data).appendTo(chatText) })
        socket.on('evalAnswer', function (data) { console.log(data) })
        // ------------------------------------------------ Render Logic ------------------------------------------------
        const renderMap = function () {
            const player = Player.list[selfId]
            const xpos = canvas[0].width / 2 - Player.list[selfId].x
            const ypos = canvas[0].height / 2 - Player.list[selfId].y
            const imgWidth = Img.map[player.map].width
            const imgHeight = Img.map[player.map].height
            ctx.drawImage(Img.map[player.map], 0, 0, imgWidth, imgHeight, xpos, ypos, imgWidth * 4, imgHeight * 4)
        }

        const renderGame = () => {
            if (selfId) {
                ctx.clearRect(0, 0, canvas[0].width, canvas[0].height)
                renderMap()
                for (let i in Player.list) { Player.list[i].render() }
                for (let i in Projectile.list) { Projectile.list[i].render() }
            }
            requestAnimationFrame(renderGame)
        }
        // initialize draw on page load
        focusCanvas()
        renderGame()
    })
}

export default jQueryApp