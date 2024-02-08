const express = require('express')
const path = require('node:path')
const bodyParser = require('body-parser');
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const dotenv = require('dotenv');
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

function indexOfMax(arr) {
  if (arr.length === 0) {
      return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
          maxIndex = i;
          max = arr[i];
      }
  }

  return maxIndex;
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
    gameConnections[gameId] = {"gameConnections": [], "gameResponses": {},"gameStatus": "Awaiting", "gameQuestion": "None"}
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
    const game = gameConnections[gameId]
    game['gameStatus'] = 'Starting'
    io.emit('gameStart', JSON.stringify({id: gameId}))
  })

  socket.on('selectWriter', (gameId) => {
    const game = gameConnections[gameId]
    game['gameStatus'] = 'Writing'
    var gamePlayers = game['gameConnections']
    var name = gamePlayers[Math.floor(Math.random()*gamePlayers.length)];
    io.emit('writerSelected', JSON.stringify({id: gameId, name: name}))
  })

  socket.on('userWrote', (userWroteData) => {
    const jsonData = JSON.parse(userWroteData)
    var gameId = jsonData.id
    var question = jsonData.question
    const game = gameConnections[gameId]
    if (game['gameStatus'] == 'Writing') {
      var name = jsonData.name
      game['gameQuestion'] = question
      game['gameStatus'] = 'Responding'
      io.emit('updateQuestion', JSON.stringify({id: gameId, question: name + '\'s Opinion: ' + question}))
    } else if (game['gameStatus'] == 'Responding') {
      var name = jsonData.name
      const game = gameConnections[gameId]
      game['gameResponses'][name] = {'response': question, 'score': 0, 'name': name}
    }
  })

  socket.on('openOpinions', (gameId) => {
    io.emit('openClientOpinions', gameId)
  })

  socket.on('timeUp', (gameId) => {
    io.emit('timesUp', gameId)
  })

  socket.on('gatherResponses', (gameId) => {
    const game = gameConnections[gameId]
    io.emit('sendResponses', JSON.stringify({id: gameId, responses: game['gameResponses']}))
  })

  socket.on('sendVote', (voteData) => {
    const jsonData = JSON.parse(voteData)
    var gameId = jsonData.id
    var voteName = jsonData.name
    const game = gameConnections[gameId]
    game['gameResponses'][voteName]['score'] = game['gameResponses'][voteName]['score'] + 1
  })

  socket.on('stopVoting', (gameId) => {
    io.emit('stopVotes', gameId)
    const game = gameConnections[gameId]
    var scores = {'count': [], 'names': []}
    for (let key in game['gameResponses']) {
      var value = game['gameResponses'][key]
      scores['count'].push(value['score'])
      scores['names'].push(value['name'])
    }
    var max = indexOfMax(scores['count'])
    var winnerName = scores['names'][max]
    var winNumber = scores['count'][max]
    game['gameStatus'] = 'Ending'
    var winText = game['gameResponses'][winnerName]['response']
    io.emit('announceWinner', JSON.stringify({winnerName: winnerName, winNumber: winNumber, id: gameId, winText: winText}))
  })

  socket.on('menuing', (gameId) => {
    const game = gameConnections[gameId]
    game['gameResponses'] = {}
    game['gameStatus'] = 'Awaiting'
    io.emit('menu', gameId)
  })

  socket.on('endGame', (gameId) => {
    io.emit('endGameHost', gameId)
    delete gameConnections[gameId]
  })
})

server.listen(3000, () => {
  console.log('Dispute started on port 3000.')
})