$(document).ready(function () {
    // ------------------------------------------------ Game Logic ------------------------------------------------
    var socket = io()
    // Canvas Selectors and Settings
    var canvas = $('#ctx')
    canvas.attr('tabindex', 0)
    canvas.contextmenu(function () { return false })
    canvas[0].width = 500
    canvas[0].height = 500
    var ctx = canvas[0].getContext("2d")
    ctx.font = '30px Arial'
    // Chat Selectors and Settings
    var chatText = $('#chat-text')
    var chatInput = $('#chat-input')
    chatInput.attr('tabindex', 0)
    var chatForm = $('#chat-form')

    var Player = function (data) {
        var self = {}
        self.id = data.id
        self.number = data.number
        self.x = data.x
        self.y = data.y
        self.currentHp = data.currentHp
        self.maxHp = data.maxHp
        self.score = data.score
        self.render = function () {
            var currentHpWidth = 30 * self.currentHp / self.maxHp
            ctx.fillStyle = "red"
            ctx.fillRect(self.x - currentHpWidth / 2, self.y - 40, 30, 4)
            ctx.fillStyle = "darkblue"
            ctx.fillRect(self.x - currentHpWidth / 2, self.y - 40, currentHpWidth, 4)
            ctx.fillStyle = "black"
            ctx.fillText(self.number, self.x, self.y)
            ctx.fillText(self.score, self.x, self.y - 60)
        }
        Player.list[self.id] = self
        return self
    }
    Player.list = {}

    var Projectile = function (data) {
        var self = {}
        self.id = data.id
        self.x = data.x
        self.y = data.y
        self.render = function() {
            ctx.fillRect(self.x, self.y, 10, 5)
        }
        Projectile.list[self.id] = self
        return self
    }
    Projectile.list = {}
    // 
    socket.on('init', function (data) {
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
    // Initialize scripts
    focusCanvas()
    setInterval(function () {
        ctx.clearRect(0, 0, 500, 500)
        for (var i in Player.list) { Player.list[i].render() }
        for (var i in Projectile.list) { Projectile.list[i].render() }
    }, 40)
})