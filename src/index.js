const express = require('express')
const routes = require('./routes')
const geo = require('./geo')
require('dotenv').config()
require('colors')

geo.findPlaces('or', '59.996176', '30.294685')

const app = express()

routes.configureRoutes(app) // Configuring routes

app.listen(80, err => {
    if (!err) {
        console.log('Server is now runnig'.green)
    } else {
        console.log(`${err}`.red)
    }
})