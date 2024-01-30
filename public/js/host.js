const socket = io()

var currentGame = false
var gameId = ''

function startGame() {
    if (currentGame != true) {
        alert('Starting Game')
        socket.emit('createGame', 'none')
        currentGame = true
    }
}

socket.on('gameCreated', (gameDetails) => {
    const jsonData = JSON.parse(gameDetails)
    var gameId = jsonData.gameId
    alert(gameId)
})