const express = require('express')
const routes = require('./routes')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
require('dotenv').config()
require('colors')

routes.configureRoutes(app) // Configuring routes
routes.configureSocketIO(io)

http.listen(process.env.port, err => {
    if (!err) {
        console.log('Server is now running'.green)
    } else {
        console.log(`${err}`.red)
    }
})