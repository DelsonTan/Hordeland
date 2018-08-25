$(document).ready(function () {
    // ------------------------------------------------ Render Logic ------------------------------------------------
    var canvas = $('#ctx')
    canvas.attr('tabindex', 0)
    canvas[0].width = 500
    canvas[0].height = 500
    var ctx = canvas[0].getContext("2d")
    ctx.font = '30px Arial'
    var socket = io()

    var renderPlayers = function (val, xpos, ypos) {
        ctx.strokeRect(xpos - 5, ypos - 25, 30, 30)
        ctx.fillText(val, xpos, ypos)
    }

    var renderProjectile = function (xpos, ypos) {
        ctx.fillRect(xpos, ypos, 10, 5)
    }

    var focusCanvas = function () {
        canvas.focus()
    }

    var blurCanvas = function () {
        canvas.blur()
    }

    // Allow canvas to be focused for event listening
    canvas.attr('tabindex', 0)

    socket.on('newPositions', function (data) {
        ctx.clearRect(0, 0, 500, 500)
        for (var i = 0; i < data.players.length; i++) {
            renderPlayers(data.players[i].number, data.players[i].x, data.players[i].y)
        }
        for (var i = 0; i < data.projectiles.length; i++) {
            renderProjectile(data.projectiles[i].x - 5, data.projectiles[i].y - 5)
        }
    })

    // Chat
    var chatText = $('#chat-text')
    var chatInput = $('#chat-input')//[0]
    chatInput.attr('tabindex', 0)
    var chatForm = $('#chat-form')//[0]

    

    // ------------------------------------------------ Event Handlers ------------------------------------------------
    // TODO: focus canvas on tabbing into game
    // TODO: cancel all player actions when tabbing out of the game
    focusCanvas()
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
            // Force player to stop moving
            socket.emit('keyPress', { inputId: 'left', state: false })
            socket.emit('keyPress', { inputId: 'right', state: false })
            socket.emit('keyPress', { inputId: 'up', state: false })
            socket.emit('keyPress', { inputId: 'down', state: false })
            // Switch focus to chat input
            event.preventDefault()
            blurCanvas()
            chatInput.focus()
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

    canvas.mousedown(function(event) {
        if (event.which === 1) {
            socket.emit('keyPress', { inputId: 'leftClick', state: true })
        } 
    })

    canvas.mouseup(function(event) {
        if (event.which === 1) {
            socket.emit('keyPress', { inputId: 'leftClick', state: false })
        } 
    })

    canvas.mousemove(function(event) {
        var x = -canvas[0].width / 2 + event.clientX - 8
        var y = -canvas[0].height / 2 + event.clientY - 8
        var angle = Math.atan2(y,x) / Math.PI * 180
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
        chatInput.blur()
        focusCanvas()
    })

    socket.on('addToChat', function (data) {
        $("<div>").text(data).appendTo(chatText)
    })
    socket.on('evalAnswer', function (data) {
        console.log(data)
    })
    // TODO: make chat scroll to bottom when new messages arrive
})