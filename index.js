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

/*var validJoinCodes = ['1AG43T']
var gameConnections = {
  'gameId': {
    'ConnectedClients': ['client1', 'client2'],
    'CurrentQuestion': 'qyestions',
    'GameStatus': 'Awaiting',
    'Responses': {
      'clientName': {
        'Response': 'response',
        'ResponseTime': 1
      }
    }
  }
}*/

var validJoinCodes = ['hello']

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

app.post('/start-host', (req, res) => {
  console.log('Sending [POST]: Start-Host')
})

io.on('connection', (socket) => {
  socket.on('joinCode', (code) => {
    if (validJoinCodes.includes(code)) {
      console.log('Accept')
      socket.emit('joinCodeCheck', '{"status": "Accept", "joinCode": "' + code + '"}')
    } else {
      console.log('Reject')
      socket.emit('joinCodeCheck', '{"status": "Reject"}')
    }
  })
  console.log('Client Connected')
})

server.listen(3000, () => {
  console.log('Dispute started on port 3000.')
})