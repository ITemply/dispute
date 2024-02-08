var socket = io()

socket.on('disconnect', function(){
    socket = io()
})

socket.on('connect', function() {
    alert('connect')
})

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

function openPanels() {
    document.getElementById('panel-r').style = 'transform: translateX(-100%); transition: transform 1.75s ease-in-out;'
    document.getElementById('panel-l').style = 'transform: translateX(100%); transition: transform 1.75s ease-in-out;'
}

function closePanels() {
    document.getElementById('panel-r').style = 'transform: translateX(0%); transition: transform 1.75s ease-in-out;'
    document.getElementById('panel-l').style = 'transform: translateX(0%); transition: transform 1.75s ease-in-out;'
}

setTimeout(function() {
    openPanels()
}, 1000)

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

socket.on('updateQuestion', (questionData) => {
    const jsonData = JSON.parse(questionData)
    var gameId = jsonData.id
    var question = jsonData.question
    if (joinCode == gameId) {
        document.getElementById('host-text').innerHTML = question
        setTimeout(function() {
            document.getElementById('host-text').innerHTML = 'Write Your Response | 30'
            socket.emit('openOpinions', gameId)
            var timeRemaining = 30
            var timer = setInterval(() => {
                timeRemaining = timeRemaining - 1
                document.getElementById('host-text').innerHTML = 'Write Your Response | ' + timeRemaining
                if (timeRemaining == 0) {
                    clearInterval(timer)
                    document.getElementById('join-code').style.display = 'none'
                    var usec = document.getElementById('user-section')
                    usec.innerHTML = ''
                    socket.emit('gatherResponses', gameId)
                    setTimeout(function() {
                        document.getElementById('host-text').innerHTML = 'Vote on the Best | 30'
                        timeRemaining = 30
                        var timer2 = setInterval(function() {
                            timeRemaining = timeRemaining - 1
                            document.getElementById('host-text').innerHTML = 'Vote on the Best | ' + timeRemaining
                            if (timeRemaining == 0) {
                                clearInterval(timer2)
                                document.getElementById('host-text').innerHTML = 'Processing Votes'
                                setTimeout(function() {
                                    closePanels()
                                    socket.emit('stopVoting', gameId)
                                }, 2500)
                            }
                        }, 1000)
                    }, 3000)
                    socket.emit('timeUp', joinCode)
                }
            }, 1000)
        }, 5500)
    }
})

socket.on('announceWinner', (winnerData) => {
    const jsonData = JSON.parse(winnerData)
    var winnerName = jsonData.winnerName
    var winNumber = jsonData.winNumber
    var gameId = jsonData.id
    if (joinCode == gameId) {
        setTimeout(function() {
            document.getElementById('host-text').innerHTML = 'Winner: ' + winnerName + ' Votes: ' + winNumber
            openPanels()
        }, 3000)
    }
})