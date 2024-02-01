const socket = io()

var joinCode = ''
var name = ''

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
    }
})

socket.on('writerSelected', (writerData) => {
    const jsonData = JSON.parse(writerData)
    var gameId = jsonData.id
    var wname = jsonData.name
    if (joinCode == gameId) {
        document.getElementById('headTitle').innerHTML = name + ' is the Writer'
        if (wname == name) {
            document.getElementById('enter-bar').style = 'transform: translateY(-100%); transition: transform 1.75s ease-in-out;'
        }
    }
})