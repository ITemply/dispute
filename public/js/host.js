const socket = io()

var currentGame = false
var joinCode = ''

function startHost() {
    if (currentGame != true) {
        socket.emit('createGame', 'none')
        currentGame = true
        document.getElementById('m-button').style.display = 'none'
        document.getElementById('host-text').innerHTML = 'Obtaining Game Id'
    }
}

socket.on('gameCreated', (gameDetails) => {
    const jsonData = JSON.parse(gameDetails)
    joinCode = jsonData.gameId
    setTimeout(function() {
        document.getElementById('host-text').innerHTML = 'Game Id Obtained'
        document.getElementById('name-enter').classList.add('move-start-game')
        document.getElementById('join-code').innerHTML = joinCode
    }, 1000)
})

socket.on('userJoinedGame', (joinDetails) => {
    const jsonData = JSON.parse(joinDetails)
    var jgameId = jsonData.gameId
    var name = jsonData.name
    if (jgameId == joinCode) {
        var usec = document.getElementById('user-section')
        usec.innerHTML = usec.innerHTML + "<div class='name-border'><span>" + name + "</span></div>"
    }
})

function startGame() {
    socket.emit('startGame', joinCode)
    document.getElementById('name-enter').style = 'transform: translateY(0%); transition: transform 1.75s ease-in-out;'
    document.getElementById('host-text').innerHTML = 'Starting Game'
    document.getElementById('binding').style = 'width: 85%;'
    setTimeout(function(){
        document.getElementById('host-text').innerHTML = 'Selecting Random Member'
        setTimeout(function() {
            socket.emit('selectWriter', joinCode)
        }, 3000)
    }, 3000)
}

socket.on('writerSelected', (writerData) => {
    const jsonData = JSON.parse(writerData)
    var gameId = jsonData.id
    var name = jsonData.name
    if (joinCode == gameId) {
        document.getElementById('host-text').innerHTML = name + ' is the Writer'
    }
})