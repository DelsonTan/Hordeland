$(document).ready(function () {
    // ------------------------------------------------ Render Logic ------------------------------------------------
    var ctx = $('#ctx')[0].getContext("2d")
    ctx.font = '30px Arial'
    var socket = io()

    socket.on('newPositions', function (data) {
        ctx.clearRect(0, 0, 500, 500)
        for (var i = 0; i < data.length; i++) {
            ctx.fillText(data[i].number, data[i].x, data[i].y)
        }
    })
    
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