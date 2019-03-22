require('colors')
let User = require('./data/User').User

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

exports.makeError = makeError
exports.makeOk = makeOk
exports.user = user