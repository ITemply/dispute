const express = require('express')
const path = require('node:path')
const bodyParser = require('body-parser');
const request = require('request')
const crypto = require('crypto')
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const dotenv = require('dotenv')
dotenv.config()

app.set('views', path.join(__dirname, 'public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

var validJoinCodes = []
var gameConnections = {}

function makeid(length) {
  let result = ''
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

app.get('/', (req, res) => {
  console.log('Sending [GET]: Index')
  res.redirect('/join')
})

app.get('/join', (req, res) => {
  console.log('Sending [GET]: Join')
  res.render('join')
})

app.get('/host', (req, res) => {
  console.log('Sending [GET]: Host')
  res.render('host')
})

io.on('connection', (socket) => {
  socket.on('joinCode', (code) => {
    if (validJoinCodes.includes(code)) {
      socket.emit('joinCodeCheck', '{"status": "Accept", "joinCode": "' + code + '"}')
    } else {
      socket.emit('joinCodeCheck', '{"status": "Reject"}')
    }
  })

  socket.on('createGame', () => {
    var gameId = makeid(6)
    while (validJoinCodes.includes(gameId)) {
      gameId = makeid(6)
    }
    validJoinCodes.push(gameId)
    gameConnections[gameId] = {"gameConnections": [], "gameResponses": {}, "gameWins": {},"gameStatus": "Awaiting", "gameQuestion": "None"}
    socket.emit('gameCreated', '{"gameId": "' + gameId + '"}')
  })

  socket.on('joinGame', (gameData) => {
    const jsonData = JSON.parse(gameData)
    var gameId = jsonData.gameId
    var joiningName = jsonData.name
    var connection = gameConnections[gameId]
    if (connection['gameStatus'] == 'Awaiting') {
      connection['gameConnections'].push(joiningName)
      io.emit('userJoinedGame', JSON.stringify({gameId: gameId, name: joiningName}))
    }
  })

  socket.on('startGame', (gameId) => {
    console.log(gameId)
    io.emit('gameStart', JSON.stringify({id: gameId}))
  })

  socket.on('selectWriter', (gameId) => {
    const game = gameConnections[gameId]
    game['gameStatus'] = 'Starting'
    var gamePlayers = game['gameConnections']
    var name = gamePlayers[Math.floor(Math.random()*gamePlayers.length)];
    io.emit('writerSelected', JSON.stringify({id: gameId, name: name}))
  })
})

server.listen(3000, () => {
  console.log('Dispute started on port 3000.')
})