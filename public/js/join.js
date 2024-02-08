var socket = io()

socket.on('disconnect', function(){
    socket = io()
})

socket.on('connect', function() {
    console.log('Client Connected')
})

var joinCode = ''
var name = ''
var voted = false

function sendJoinCode() {
    const code = document.getElementById('code')
    socket.emit('joinCode', code.value)
}

function joinGame() {
    if (name == '') {
        document.getElementById('name-enter').style = 'transform: translateY(-100%); transition: transform 1.75s ease-in-out;'

        var settingName = document.getElementById('name').value
        name = settingName

        sendingData = { gameId: joinCode, name: settingName }

        socket.emit('joinGame', JSON.stringify(sendingData))
        setTimeout(function(){
            document.getElementById('bb').style.display = 'none'
            document.getElementById('headTitle').innerHTML = 'Game Starting Soon'
        }, 1750)
    }
}

function logError(errorText) {
    const errorElement = document.getElementById('error')

    if (errorText == 'Delete') {
        errorElement.style.display = 'none'
    } else {
        errorElement.style.display = 'block'
        errorElement.innerHTML = errorText
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

socket.on('joinCodeCheck', (codeData) => {
    const jsonData = JSON.parse(codeData)
    var status = jsonData.status
    var joiningCode = jsonData.joinCode

    if (status == 'Accept') {
        logError('Delete')
        joinCode = joiningCode
        document.getElementById('headTitle').innerHTML = 'Enter a Name'
        document.getElementById('name').style.display = 'block'
        document.getElementById('join').style.display = 'block'
        document.getElementById('code').style.display = 'none'
    }
})

socket.on('gameStart', (startData) => {
    const jsonData = JSON.parse(startData)
    var sgameId = jsonData.id
    if (sgameId == joinCode) {
        document.getElementById('name-enter').style = 'transform: translateY(0%); transition: transform 1.75s ease-in-out;'
        document.getElementById('binding').style = 'width: 85%;'
        document.getElementById('bottom-text').style.display = 'none'
    }
    voted = false
})

socket.on('writerSelected', (writerData) => {
    const jsonData = JSON.parse(writerData)
    var gameId = jsonData.id
    var wname = jsonData.name
    if (joinCode == gameId) {
        document.getElementById('headTitle').innerHTML = wname + ' is the Writer'
        if (wname == name) {
            document.getElementById('enter-bar').style = 'transform: translateY(-100%); transition: transform 1.75s ease-in-out;'
        }
    }
})

socket.on('updateQuestion', (questionData) => {
    const jsonData = JSON.parse(questionData)
    var gameId = jsonData.id
    var question = jsonData.question
    if (joinCode == gameId) {
        document.getElementById('headTitle').innerHTML = question
    }
})

function submitOpinion() {
    var question = document.getElementById('opinion').value
    socket.emit('userWrote', JSON.stringify({id: joinCode, name: name, question: question}))
    document.getElementById('enter-bar').style = 'transform: translateY(100%); transition: transform 1.75s ease-in-out;'
    document.getElementById('opinion').placeholder = 'Your Opinion Here'
    document.getElementById('opinion').value = ''
}

socket.on('openClientOpinions', (gameId) => {
    if (joinCode == gameId) {
        document.getElementById('enter-bar').style = 'transform: translateY(-100%); transition: transform 1.75s ease-in-out;'
        document.getElementById('opinion').placeholder = 'Your Response Opinion Here'
    }
})

socket.on('timesUp', (gameId) => {
    if (joinCode == gameId) {
        document.getElementById('enter-bar').style = 'transform: translateY(100%); transition: transform 1.75s ease-in-out;'
        document.getElementById('opinion').placeholder = 'Your Opinion Here'
        document.getElementById('opinion').value = ''
        setTimeout(function() {
            document.getElementById('name-enter').style = 'transform: translateY(-100%); transition: transform 1.75s ease-in-out;'
        }, 3000)
    }
})

socket.on('sendResponses', (responseData) => {
    const jsonData = JSON.parse(responseData)
    var gameId = jsonData.id
    var responses = jsonData.responses
    if (gameId == joinCode) {
        document.getElementById('user-section').innerHTML = ''
        for (let key in responses) {
            var value = responses[key]
            document.getElementById('user-section').innerHTML = document.getElementById('user-section').innerHTML + '<div class="response"><span class="response-text">'+value['response']+'</span> <input class="response-input" type="button" value="Vote" onclick="voteResponse(\''+value['name']+'\')"></div>'
        }
    }
})

function voteResponse(vname) {
    if (voted == false) {
        voted = true
        socket.emit('sendVote', JSON.stringify({'id': joinCode, 'name': vname}))
        document.getElementById('headTitle').innerHTML = 'Your Vote is In'
        document.getElementById('name-enter').style = 'transform: translateY(0%); transition: transform 1.75s ease-in-out;'
    }
}

socket.on('stopVotes', (gameId) => {
    if (joinCode == gameId) {
        document.getElementById('name-enter').style = 'transform: translateY(0%); transition: transform 1.75s ease-in-out;'
        closePanels()
        setTimeout(function() {
            document.getElementById('user-section').innerHTML = '<div class="name-border"><span>You\'re still in! The game host will start the next match soon.</span></div>'
        }, 3000)
    }
})

socket.on('announceWinner', (winnerData) => {
    const jsonData = JSON.parse(winnerData)
    var winnerName = jsonData.winnerName
    var winNumber = jsonData.winNumber
    var winText = jsonData.winText
    var gameId = jsonData.id
    if (joinCode == gameId) {
        setTimeout(function() {
            document.getElementById('headTitle').innerHTML = 'Winning Opinion: ' + winText + ' Writer: '+winnerName+' Votes: ' + winNumber
            openPanels()
        }, 3000)
    }
})

socket.on('menu', function(gameId){
    if (joinCode == gameId) {
        document.getElementById('name-enter').style = 'transform: translateY(-100%); transition: transform 1.75s ease-in-out;'
        setTimeout(function() {
            document.getElementById('headTitle').innerHTML = 'Game Starting Soon'
        }, 2000)
    }
})

socket.on('endGameHost', function(gameId){
    if (joinCode == gameId) {
        document.getElementById('name-enter').style = 'transform: translateY(0%); transition: transform 1.75s ease-in-out;'
        document.getElementById('headTitle').innerHTML = 'Game Ended'
    }
})