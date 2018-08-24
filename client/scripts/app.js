$(document).ready(function () {
    // ------------------------------------------------ Render Logic ------------------------------------------------
    var canvas = $('#ctx')[0]
    canvas.width = 500
    canvas.height = 500
    var ctx = canvas.getContext("2d")
    ctx.font = '30px Arial'
    var socket = io()

    socket.on('newPositions', function (data) {
        ctx.clearRect(0, 0, 500, 500)
        for (var i = 0; i < data.players.length; i++) {
            renderPlayers(data.players[i].number, data.players[i].x, data.players[i].y)
        }
        for (var i = 0; i < data.projectiles.length; i++) {
            console.log(data.projectiles)
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
    // ------------------------------------------------ Event Handlers ------------------------------------------------
    $(document).on("keydown", function(event) {
        // WASD keys
        if (event.which === 65) {
            socket.emit('keyPress', {inputId: 'left', state: true})
        } else if (event.which === 68) {
            socket.emit('keyPress', {inputId: 'right', state: true})
        } else if (event.which === 87) {
            socket.emit('keyPress', {inputId: 'up', state: true})
        } else if (event.which === 83) {
            socket.emit('keyPress', {inputId: 'down', state: true})
        } 
    })

    $(document).on("keyup", function(event) {
        // WASD keys
        if (event.which === 65) {
            socket.emit('keyPress', {inputId: 'left', state: false})
        } else if (event.which === 68) {
            socket.emit('keyPress', {inputId: 'right', state: false})
        } else if (event.which === 87) {
            socket.emit('keyPress', {inputId: 'up', state: false})
        } else if (event.which === 83) {
            socket.emit('keyPress', {inputId: 'down', state: false})
        } 
    })
})