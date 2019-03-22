const express = require('express')
const routes = require('./routes')
require('dotenv').config()
require('colors')

const app = express()

routes.configureRoutes(app) // Configuring routes

app.listen(80, err => {
    if (!err) {
        console.log('Server is now runnig'.green)
    } else {
        console.log(`${err}`.red)
    }
})