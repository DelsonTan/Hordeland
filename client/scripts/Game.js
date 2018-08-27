$(document).ready(function () {
    var socket = io()
    // Canvas Selectors and Settings
    var canvas = $('#ctx')
    canvas.attr('tabindex', 0)
    canvas.contextmenu(function () { return false })
    var WIDTH = canvas[0].width 
    var HEIGHT = canvas[0].height 
    var ctx = canvas[0].getContext("2d")
    ctx.font = '30px Arial'
    // Chat Selectors and Settings
    var chatText = $('#chat-text')
    var chatInput = $('#chat-input')
    var chatForm = $('#chat-form')
    // Images
    var Img = {}
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
    var selfId = null
    var Player = function (params) {
        var self = {}
        self.id = params.id
        self.number = params.number
        self.x = params.x
        self.y = params.y
        self.currentHp = params.currentHp
        self.maxHp = params.maxHp
        self.score = params.score
        self.map = params.map
        self.render = function () {
            if (Player.list[selfId].map !== self.map) {
                return
            }
            var xpos = self.x - Player.list[selfId].x + WIDTH/2
            var ypos = self.y - Player.list[selfId].y + HEIGHT/2
            // hp bar
            var currentHpWidth = 30 * self.currentHp / self.maxHp
            ctx.fillStyle = "darkred"
            ctx.fillRect(xpos - currentHpWidth / 2, ypos - 40, 30, 4)
            ctx.fillStyle = "darkblue"
            ctx.fillRect(xpos - currentHpWidth / 2, ypos - 40, currentHpWidth, 4)
            // player sprite
            var width = Img.player.width * 2
            var height = Img.player.height * 2
           
            ctx.drawImage(Img.player, 0, 0, Img.player.width, Img.player.height, 
                xpos - width/2, ypos - height/2, width, height)
        }
        Player.list[self.id] = self
        return self
    }
    Player.list = {}

    var Projectile = function (params) {
        var self = {}
        self.id = params.id
        self.x = params.x
        self.y = params.y
        self.map = params.map
        self.render = function() {
            if (Player.list[selfId].map !== self.map) {
                return
            }
            var imgWidth = Img.player.width / 2
            var imgHeight = Img.player.height / 2
            var xpos = self.x - Player.list[selfId].x + WIDTH/2
            var ypos = self.y - Player.list[selfId].y + HEIGHT/2

            ctx.drawImage(Img.bullet, 0, 0, Img.bullet.width, Img.bullet.height, 
                xpos - imgWidth/2, ypos - imgHeight/2, imgWidth, imgHeight)
        }
        Projectile.list[self.id] = self
        return self
    }
    Projectile.list = {}

    socket.on('init', function (data) {
        if (data.selfId) { selfId = data.selfId }
        for (var i = 0; i < data.players.length; i++) {
            new Player(data.players[i])
        }
        for (var i = 0; i < data.projectiles.length; i++) {
            new Projectile(data.projectiles[i])
        }
    })

    socket.on('update', function (data) {
        for (var i = 0; i < data.players.length; i++) {
            var newPlayerData = data.players[i]
            var player = Player.list[newPlayerData.id]
            if (player) {
                if (player.x !== undefined) { player.x = newPlayerData.x }
                if (player.y !== undefined) { player.y = newPlayerData.y }
                if (player.currentHp !== undefined) { player.currentHp = newPlayerData.currentHp }
                if (player.maxHp !== undefined) { player.maxHp = newPlayerData.maxHp }
                if (player.score !== undefined) { player.score = newPlayerData.score }
            }
        }
        for (var i = 0; i < data.projectiles.length; i++) {
            var newProjectileData = data.projectiles[i]
            var projectile = Projectile.list[newProjectileData.id]
            if (projectile) {
                if (projectile.x !== undefined) { projectile.x = newProjectileData.x }
                if (projectile.y !== undefined) { projectile.y = newProjectileData.y }
            }
        }
    })

    socket.on('remove', function (data) {
        for (var i = 0; i < data.players.length; i++) {
            delete Player.list[data.players[i]]
        }
        for (var i = 0; i < data.projectiles.length; i++) {
            delete Projectile.list[data.projectiles[i]]
        }
    })

    // ------------------------------------------------ Event Handlers ------------------------------------------------
    // TODO: focus canvas on tabbing into game
    // TODO: cancel all player actions when tabbing out of the game
    // TODO: make chat scroll to bottom when new messages arrive
    var focusCanvas = function () { canvas.focus() }
    var blurCanvas = function () { canvas.blur() }
    var focusChat = function () { chatInput.focus() }
    var blurChat = function () { chatInput.blur() }
    // Cancels all player key press events
    cancelPlayerKeyPress = function () {
        socket.emit('keyPress', { inputId: 'left', state: false })
        socket.emit('keyPress', { inputId: 'right', state: false })
        socket.emit('keyPress', { inputId: 'up', state: false })
        socket.emit('keyPress', { inputId: 'down', state: false })
        socket.emit('keyPress', { inputId: 'leftClick', state: false })
    }

    canvas.on("keydown", function (event) {
        // WASD keys
        if (event.which === 65) {
            socket.emit('keyPress', { inputId: 'left', state: true })
        } else if (event.which === 68) {
            socket.emit('keyPress', { inputId: 'right', state: true })
        } else if (event.which === 87) {
            socket.emit('keyPress', { inputId: 'up', state: true })
        } else if (event.which === 83) {
            socket.emit('keyPress', { inputId: 'down', state: true })
        } else if (event.which === 13) {
            event.preventDefault()
            cancelPlayerKeyPress()
            blurCanvas()
            focusChat()
        }
    })

    canvas.on("keyup", function (event) {
        // WASD keys
        if (event.which === 65) {
            socket.emit('keyPress', { inputId: 'left', state: false })
        } else if (event.which === 68) {
            socket.emit('keyPress', { inputId: 'right', state: false })
        } else if (event.which === 87) {
            socket.emit('keyPress', { inputId: 'up', state: false })
        } else if (event.which === 83) {
            socket.emit('keyPress', { inputId: 'down', state: false })
        }
    })

    canvas.mousedown(function (event) {
        if (event.which === 1) {
            socket.emit('keyPress', { inputId: 'leftClick', state: true })
        }
    })

    canvas.mouseup(function (event) {
        if (event.which === 1) {
            socket.emit('keyPress', { inputId: 'leftClick', state: false })
        }
    })

    canvas.mousemove(function (event) {
        var x = -canvas[0].width / 2 + event.clientX - 8
        var y = -canvas[0].height / 2 + event.clientY - 8
        var angle = Math.atan2(y, x) / Math.PI * 180
        socket.emit('keyPress', { inputId: 'mouseAngle', state: angle })
    })
    // Chat
    chatForm.submit(function (event) {
        event.preventDefault()
        if (chatInput.val()[0] === '/') {
            socket.emit('evalMessage', { text: chatInput.val().slice(1) })
        } else {
            socket.emit('sendMessage', { text: chatInput.val() })
        }
        chatInput.val("")
        blurChat()
        focusCanvas()
    })

    socket.on('addToChat', function (data) {
        $("<div>").text(data).appendTo(chatText)
    })
    socket.on('evalAnswer', function (data) {
        console.log(data)
    })

    // ------------------------------------------------ Render Logic ------------------------------------------------
    var renderMap = function() {
        var player = Player.list[selfId]
        var xpos = WIDTH / 2 - Player.list[selfId].x
        var ypos = HEIGHT / 2 - Player.list[selfId].y
        ctx.drawImage(Img.map[player.map], xpos, ypos) 
    }
    var renderScore = function() { ctx.fillStyle = "black", ctx.fillText(Player.list[selfId].score, 0, 30) }
    // Initialize scripts
    focusCanvas()
    setInterval(function () {
        if (!selfId) { return }
        ctx.clearRect(0, 0, 500, 500)
        renderMap()
        renderScore()
        for (var i in Player.list) { Player.list[i].render() }
        for (var i in Projectile.list) { Projectile.list[i].render() }
    }, 40)
})