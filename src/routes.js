const utils = require('./utils')
const bodyParser = require('body-parser')
const db = require('./db')
const geo = require('./geo')
const validators = require('./validators')
const Connection = require('./data/Connection').Connection

function configureRoutes(app) {
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    registerMiddlewares(app)
    configureAuth(app)
    configureConcerts(app)
    configureGeo(app)
}

let connections = []

function configureSocketIO(io) {
    io.on('connection', socket => {
        console.log('New connection'.magenta)
        const connection = new Connection(socket)

        registerIOHandlers(connection)

        connections.push(connection)
    })
}

function broadcastEmojiClick(concertId, index) {
    console.log(`Broadcasting new emoji ${index} ${concertId}`)
    connections.forEach(conn => {
        conn.socket.emit('tray new emoji', { index: index, concertId: concertId })
    })
}

function registerIOHandlers(connection) {
    connection.socket.on('auth', async data => {
        let login = data.login
        let password = data.password
        console.log(`${login} ${password}`.magenta)
        let user = await db.getUser(login, password)
        if (user !== undefined && user !== null) {
            console.log('Successfully authorized'.green)
            const token = utils.generateToken(user)
            user.token = token
            console.log(user)
            connection.userId = user._id
            connection.authenticated = true
            connection.socket.emit('auth succeed', { user })
        } else {
            console.log('Wrong login attempt'.red)
            connection.socket.emit('auth failed', 'Wrong login or password')
        }
    })

    connection.socket.on('getAllConcerts', (msg) => {
        if (connection.authenticated) {
            console.log('getAllConcerts was called'.yellow)
            db.getAllConcerts()
                .then(data => {
                    console.log('Sending all concerts'.yellow)
                    connection.socket.emit('allConcerts', data)
                })
                .catch(err => {
                    connection.socket.emit('loading error', err)
                })
        } else {
            console.log(connection.socket)
            connection.socket.emit('loading error', 'You are not logged in')
        }
    })

    connection.socket.on('getUserConcerts', (msg) => {
        if (connection.authenticated) {
            console.log('getUserConcerts was called'.yellow)
            db.getUserConcerts(connection.userId)
                .then(data => {
                    console.log('Sending user concerts'.yellow)
                    connection.socket.emit('userConcerts', data)
                })
                .catch(err => {
                    connection.socket.emit('loading error', err)
                })
        } else {
            connection.socket.emit('loading error', 'You are not logged in')
        }
    })

    connection.socket.on('addToSchedule', concertId => {
        console.log('Adding to schedule')
        console.log(concertId, connection.userId)
        if (connection.userId)
            db.addToSchedule(connection.userId, concertId)
    })

    connection.socket.on('emoji clicked', (msg) => {
        console.log(msg)
        const index = msg.index
        const concertId = msg.concertId
        if (index < 1 || index > 6) {
            console.log('Bad index'.red)
            connection.socket.emit('operation error', 'Your indes is bad')
        } else if (concertId === undefined) {
            console.log('Bad concert id'.red)
            connection.socket.emit('operation error', 'contestId is empty')
        } else {
            db.clickEmoji(concertId, index)
                .then(() => {
                    console.log('Succeed'.cyan)
                    broadcastEmojiClick(concertId, index)
                })
                .catch((err) => {
                    console.log(err)
                    console.log('Errored'.red)
                })
        }
    })
}

function registerMiddlewares(app) {
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use((req, res, next) => {
        console.log(`[${req.method}] ${req.url}`.cyan)
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
        const regReq = utils.ejectRegisterData(req)
        const login = regReq.login, password = regReq.password, name = regReq.name, surname = regReq.surname, userType = regReq.userType
        const validation = validators.validateRegistrationUserData(login, password, name, surname, userType)
        if (validation !== undefined) {
            res.send(utils.makeError(validation))
        } else {
            db.addUser(login, password, name, surname, userType)
                .then(() => {
                    res.send(utils.makeOk('You were successfully registered'))
                })
                .catch(() => {
                    res.send(utils.makeError('Server database error please try later'))
                })
        }
    })
}

function configureConcerts(app) {
    app.all('/concerts/getAll', (req, res) => {
        // const token = utils.ejectToken(req)
        // const userInfo = utils.decodeToken(token)
        // if (userInfo === undefined) {
        //     res.send(utils.makeError('You\'re not logged in'))
        //     return
        // }
        db.getAllConcerts()
            .then(data => {
                res.send(utils.makeOk(data))
            })
            .catch(err => {
                res.send(utils.makeError(err))
            })
    })

    app.all('/concerts/addToSchedule', (req, res) => {
        const token = utils.ejectToken(req)
        const concertId = utils.ejectConcertId(req)
        const userInfo = utils.decodeToken(token)
        if (concertId === undefined) {
            res.send(utils.makeError('Please specify concertId'))
        } else if (userInfo === undefined) {
            res.send(utils.makeError('Please login'))
        } else {
            db.addToSchedule(userInfo.id, concertId)
                .then(msg => {
                    res.send(utils.makeOk(msg))
                })
                .catch(() => {
                    res.send(utils.makeError('Server error, please try later'))
                })
        }
    })

    app.all('/concerts/getUserConcerts', (req, res) => {
        const token = utils.ejectToken(req)
        const userInfo = utils.decodeToken(token)
        if (userInfo === undefined) {
            res.send(db.makeOk('Please login'))
        } else {
            db.getUserConcerts(userInfo.id)
                .then(data => {
                    res.send(utils.makeOk(data))
                })
                .catch(() => {
                    res.send(utils.makeError('Server error'))
                })
        }
    })

    app.all('/concerts/createNewConcert', async (req, res) => {
        const user = utils.user(req)
        if (!user.logged()){
            res.send(utils.makeError('You\'re not logged in'))
            return
        }
        try {
            let fullUserInfo = await db.getUserById(user.getUserId())
            console.log(fullUserInfo)
            if (fullUserInfo.userType !== 'artist') {
                res.send(utils.makeError('You are not an artist sorry'))
            } else {
                const concertInfo = utils.ejectAddConcertData(req)
                res.send(utils.makeError('This functionality is not provided yet'))
            }
        } catch(err) {
            console.log(err)
            res.send(utils.makeError('Server error, please try later'))
        }
    })
}

function configureGeo(app) {
    app.all('/geo/search', (req, res) => {
        const searchReq = utils.parseSearch(req)
        console.log(searchReq)
        if (searchReq.latitude === undefined || searchReq.longitude === undefined) {
            res.send(utils.makeError('Latitude or longitude is undefined'))
        } else {
            if (searchReq.query === undefined) {
                res.send(utils.makeError('Request query is undefined'))
            } else if (searchReq.query.length == 0) {
                res.send(utils.makeOk([]))
            } else {
                geo.findPlaces(searchReq.query, searchReq.latitude, searchReq.longitude)
                    .then(data => {
                        res.send(utils.makeOk(data))
                    })
                    .catch(() => res.send(utils.makeError('Nothing was found')))
            }
        }
    })
}

exports.configureRoutes = configureRoutes
exports.configureSocketIO = configureSocketIO
