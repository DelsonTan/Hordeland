$(document).ready(function () {
    // ------------------------------------------------ Render Logic ------------------------------------------------
    // Canvas
    var canvas = $('#ctx')
    // Allow canvas to be focused for event listening
    canvas.attr('tabindex', 0)
    canvas[0].width = 500
    canvas[0].height = 500
    var ctx = canvas[0].getContext("2d")
    ctx.font = '30px Arial'
    var socket = io()

    socket.on('newPositions', function (data) {
        ctx.clearRect(0, 0, 500, 500)
        for (var i = 0; i < data.players.length; i++) {
            renderPlayers(data.players[i].number, data.players[i].x, data.players[i].y)
        }
        for (var i = 0; i < data.projectiles.length; i++) {
            renderProjectile(data.projectiles[i].x - 5, data.projectiles[i].y - 5)
        }
    })

    function renderPlayers(val, xpos, ypos) {
        ctx.strokeRect(xpos - 5, ypos - 25, 30, 30)
        ctx.fillText(val, xpos, ypos)
    }

    function renderProjectile(xpos, ypos) {
        ctx.fillRect(xpos, ypos, 10, 5)
    }
    // Chat
    var chatText = $('#chat-text')
    var chatInput = $('#chat-input')//[0]
    chatInput.attr('tabindex', 0)
    var chatForm = $('#chat-form')//[0]

    

    // ------------------------------------------------ Event Handlers ------------------------------------------------
    // Window
    $(window).focus(function (event) {

    })
    // Canvas
    canvas.attr('tabindex', 0)
    canvas.focus()
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
            canvas.blur()
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
        canvas.focus()
    })

    socket.on('addToChat', function (data) {
        $("<div>").text(data).appendTo(chatText)
    })
    socket.on('evalAnswer', function (data) {
        console.log(data)
    })
    // TODO: make chat scroll to bottom when new messages arrive
})