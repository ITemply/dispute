//timtamtemtil

const express = require('express')
const path = require('node:path')
const bodyParser = require('body-parser');
const request = require('request')
const crypto = require('crypto')
const app = express()
const dotenv = require('dotenv')
dotenv.config()

app.set('views', path.join(__dirname, 'public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  console.log('Sending [GET]: Index')
  res.render('index')
})


app.listen(3000, () => {
  console.log('Dispute started on port 3000.')
})