$(document).ready(function () {
    // ------------------------------------------------ Render Logic ------------------------------------------------
    // GameRenderer Class for managing render configuration
    // Assign: jQuery canvas selector, canvas width and canvas height
    function GameRenderer(element, width, height) {
        this.canvas = element
        this.width = this.canvas[0].width = width
        this.height = this.canvas[0].height = height
        // allow canvas to be tabbed into and listen to events
        this.canvas.attr('tabindex', 0)
        this.ctx = this.canvas[0].getContext("2d")
        // default font
        this.ctx.font = '30px Arial'
        this.socket = io()
        
    }

    GameRenderer.prototype.renderPlayers = function (val, xpos, ypos) {
        this.ctx.strokeRect(xpos - 5, ypos - 25, 30, 30)
        this.ctx.fillText(val, xpos, ypos)
    }

    GameRenderer.prototype.renderProjectile = function (xpos, ypos) {
        this.ctx.fillRect(xpos, ypos, 10, 5)
    }

    GameRenderer.prototype.focusCanvas = function () {
        this.canvas.focus()
    }

    GameRenderer.prototype.blurCanvas = function () {
        this.canvas.blur()
    }

    var gameRenderer = new GameRenderer($('#ctx'), 500, 500)
    // Allow canvas to be focused for event listening
    gameRenderer.canvas.attr('tabindex', 0)

    gameRenderer.socket.on('newPositions', function (data) {
        gameRenderer.ctx.clearRect(0, 0, 500, 500)
        for (var i = 0; i < data.players.length; i++) {
            gameRenderer.renderPlayers(data.players[i].number, data.players[i].x, data.players[i].y)
        }
        for (var i = 0; i < data.projectiles.length; i++) {
            gameRenderer.renderProjectile(data.projectiles[i].x - 5, data.projectiles[i].y - 5)
        }
    })

    // Chat
    var chatText = $('#chat-text')
    var chatInput = $('#chat-input')//[0]
    chatInput.attr('tabindex', 0)
    var chatForm = $('#chat-form')//[0]

    

    // ------------------------------------------------ Event Handlers ------------------------------------------------
    // Window
    // $(window).focus(function (event) {

    // })
    
    gameRenderer.focusCanvas()
    gameRenderer.canvas.on("keydown", function (event) {
        // WASD keys
        if (event.which === 65) {
            gameRenderer.socket.emit('keyPress', { inputId: 'left', state: true })
        } else if (event.which === 68) {
            gameRenderer.socket.emit('keyPress', { inputId: 'right', state: true })
        } else if (event.which === 87) {
            gameRenderer.socket.emit('keyPress', { inputId: 'up', state: true })
        } else if (event.which === 83) {
            gameRenderer.socket.emit('keyPress', { inputId: 'down', state: true })
        } else if (event.which === 13) {
            // Force player to stop moving
            gameRenderer.socket.emit('keyPress', { inputId: 'left', state: false })
            gameRenderer.socket.emit('keyPress', { inputId: 'right', state: false })
            gameRenderer.socket.emit('keyPress', { inputId: 'up', state: false })
            gameRenderer.socket.emit('keyPress', { inputId: 'down', state: false })
            // Switch focus to chat input
            event.preventDefault()
            gameRenderer.blurCanvas()
            chatInput.focus()
        }
    })

    gameRenderer.canvas.on("keyup", function (event) {
        // WASD keys
        if (event.which === 65) {
            gameRenderer.socket.emit('keyPress', { inputId: 'left', state: false })
        } else if (event.which === 68) {
            gameRenderer.socket.emit('keyPress', { inputId: 'right', state: false })
        } else if (event.which === 87) {
            gameRenderer.socket.emit('keyPress', { inputId: 'up', state: false })
        } else if (event.which === 83) {
            gameRenderer.socket.emit('keyPress', { inputId: 'down', state: false })
        }
    })

    gameRenderer.canvas.mousedown(function(event) {
        if (event.which === 1) {
            gameRenderer.socket.emit('keyPress', { inputId: 'leftClick', state: true })
        } 
    })

    gameRenderer.canvas.mouseup(function(event) {
        if (event.which === 1) {
            gameRenderer.socket.emit('keyPress', { inputId: 'leftClick', state: false })
        } 
    })

    gameRenderer.canvas.mousemove(function(event) {
        var x = -gameRenderer.width / 2 + event.clientX - 8
        var y = -gameRenderer.height / 2 + event.clientY - 8
        var angle = Math.atan2(y,x) / Math.PI * 180
        gameRenderer.socket.emit('keyPress', { inputId: 'mouseAngle', state: angle })
    })
    // Chat
    chatForm.submit(function (event) {
        event.preventDefault()
        if (chatInput.val()[0] === '/') {
            gameRenderer.socket.emit('evalMessage', { text: chatInput.val().slice(1) })
        } else {
            gameRenderer.socket.emit('sendMessage', { text: chatInput.val() })
        }
        chatInput.val("")
        chatInput.blur()
        gameRenderer.focusCanvas()
    })

    gameRenderer.socket.on('addToChat', function (data) {
        $("<div>").text(data).appendTo(chatText)
    })
    gameRenderer.socket.on('evalAnswer', function (data) {
        console.log(data)
    })
    // TODO: make chat scroll to bottom when new messages arrive
})