require('colors')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('./data/User').User

function makeError(error) {
    return { type: 'error', error: error }
}

function makeOk(data) {
    return { type: 'ok', data: data }
}

function user(req) {
    if (req.method === 'GET') {
        let user = new User()
        user.token = req.query.token
        user.login = req.query.login
        return user
    } else if (req.method === 'POST') {
        let user = new User()
        user.token = req.body.token
        user.login = req.body.login
        return user
    } else {
        console.log(`Unknown method: ${req.method}`.red)
    }
    return undefined
}

function ejectLoginPass(req) {
    if (req.method === 'GET') {
        return {
            login: req.query.login,
            password: req.query.password
        }
    } else if (req.method === 'POST') {
        return {
            login: req.query.login,
            password: req.query.password
        }
    } else {
        console.log(`Unknown method: ${req.method}`.red)
    }
    return undefined
}

function ejectRegisterData(req) {
    let res = {}
    if (req.method === 'GET') {
        res.login = req.query.login
        res.password = req.query.password
        res.name = req.query.name
        res.surname = req.query.surname
        res.userType = req.query.userType
    } else if (req.method === 'POST') {
        res.login = req.body.login
        res.password = req.body.password
        res.name = req.body.name
        res.surname = req.body.surname
        res.userType = req.body.userType
    }
    return res
}

function generateToken(user) {
    return jwt.sign({ login: user.login, id: user._id } , process.env.secret)
}

function parseSearch(req) {
    let search = {}
    if (req.method === 'GET') {
        search.query = req.query.query
        search.longitude = req.query.longitude
        search.latitude = req.query.latitude
    } else if (req.method === 'POST') {
        search.query = req.body.query
        search.longitude = req.body.longitude
        search.latitude = req.body.latitude
    }
    return search
}

function ejectAddConcertData(req) {
    let res = {}
    return res
}

exports.makeError = makeError
exports.makeOk = makeOk
exports.user = user
exports.generateToken = generateToken
exports.ejectLoginPass = ejectLoginPass
exports.parseSearch = parseSearch
exports.ejectRegisterData = ejectRegisterData
exports.ejectAddConcertData = ejectAddConcertData
