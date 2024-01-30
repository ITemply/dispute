const socket = io()

var joinCode = ''

function sendJoinCode() {
    const code = document.getElementById('code')
    socket.emit('joinCode', code.value)
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
        alert('Joining Game' + joiningCode)
    }
})