const utils = require('./utils')
const bodyParser = require('body-parser')
const db = require('./db')

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
        const logPass = utils.ejectLoginPass(req)
        const login = logPass.login
        const password = logPass.password
        db.getUser(login, password)
            .then(user => {
                user.token = utils.generateToken(user)
                res.send(utils.makeOk(user))
            })
            .catch(() => {
                res.send(utils.makeError('Wrong login or password'))
            })
    })

    app.all('/auth/register', (req, res) => {
        res.send(utils.makeError('Not ready'))
    })
}

function configureConcerts(app) {
    app.all('/concerts/getAll', (req, res) => {
        const user = utils.user(req)
        if (!user.logged()) {
            res.send(utils.makeError('You\'re not logged in'))
            return
        }
        // Login is ok
        res.send(utils.makeError('Not ready'))
    })
}

exports.configureRoutes = configureRoutes