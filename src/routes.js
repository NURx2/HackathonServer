const utils = require('./utils')
const bodyParser = require('body-parser')

function configureRoutes(app) {
    registerMiddlewares(app)
    configureAuth(app)
    configureConcerts(app)
}

function registerMiddlewares(app) {
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use((req, res, next) => {
        let user = utils.user(req)
        console.log(user)
        next()
    })
}

function configureAuth(app) {
    app.all('/auth/login', (req, res) => {
        res.send(utils.makeError('Not ready'))
    })

    app.all('/auth/register', (req, res) => {
        res.send(utils.makeError('Not ready'))
    })
}

function configureConcerts(app) {
    app.all('/concerts/getAll', (req, res) => {
        const users = utils.user(req)
    })
}

exports.configureRoutes = configureRoutes