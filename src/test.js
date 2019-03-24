const db = require('./db')
const io = require('socket.io-client')
const ObjectID = require('mongodb').ObjectID
const bParser = require('body-parser')
const utils = require('./utils')
require('colors')

const express = require('express')
let app = express()

app.use('/', express.static(__dirname + '/public/'))
app.use(bParser.json())

app.post('/toggleActive', (req, res) => {
    const concertId = req.body.concertId
    console.log(concertId)
    db.toggleActivation(concertId)
        .then(data => {
            console.log(data)
            res.send(utils.makeOk())
        })
        .catch(err => {
            res.send(utils.makeError())
        })
})

app.post('/changeDate', (req, res) => {
    const concertId = req.body.concertId
    const date = req.body.date
    db.changeDate(concertId, date)
    res.send({ type: 'ok' })
})

db.onConnect(() => {
    app.listen(80, err => {
        if (err) {
            console.log(err)
        } else {
            console.log('Started')
        }
    })
})

// db.onConnect(() => {
//     db.getAllConcerts()
//         .then(async data => {
//             let amount = 0
//             for (let i = 0; i != data.length; ++i) {
//                 if (new Date() <= new Date(data[i].date) && new Date(data[i].date) <= new Date(new Date().getTime() + 259200000 * 2)) {
//                     await db.addToSchedule('5c9553ade7179a0e408b7407', data[i]._id + '')
//                     // amount += 1
//                     // console.log(new Date(data[i].date))
//                     /* try {
//                         let res = await db.deleteConcert(data[i]._id)
//                         if (res.n == 1) {
//                             console.log('Removed')
//                         } else {
//                             console.log('Not found')
//                         }
//                     } catch(err) {
//                         console.log(err)
//                     } */ 
//                 }
//             }
//         })
//         .catch(err => {
//             console.log(err)
//         })
//         .finally(() => {
//             db.close()
//         })
// })

// const socket = io.connect('http://zverevkazan.com:81')

// socket.on('connect', () => {
//     console.log('Connected'.green)
//     socket.emit('auth', { login: 'demo', password: 'demo' })
    
//     socket.on('auth succeed', msg => {
//         const user = msg.user
//         const token = user.token
//         console.log(user)

//         socket.emit('getUserConcerts')

//         socket.on('tray new emoji', msg => {
//             console.log(msg)
//         })

//         socket.on('userConcerts', data => {
//             console.log(data)
//             let ids = data.map(elem => elem._id)

//             setInterval(() => {
//                 console.log('Sending click')
//                 socket.emit('emoji clicked', { concertId: ids[4], index: 4 })
//             }, 100)

//             // for (let i = 1; i != 7; ++i)
//                 // socket.emit('emoji clicked', { concertId: ids[0], index: i })

//         })
//     })
// })

// setTimeout(() => {
//     const database = db.getDB()
//     database.collection('concerts')
//         .updateMany({}, { $set: { emoji: [ 0, 0, 0, 0, 0, 0 ] } }, (err, data) => {
//             console.log(err, data)
//             db.close()
//         })
// }, 2500)

// app.get('/', (req, res) => {
//     geo.loadMap({ latitude: '59.944595', longitude: '30.312003' }, 500, 500, 12)
//         .then(data => {
//             data.pipe(res)
//         })
//         .catch(err => {
//             console.log(err)
//             res.send('Error')
//         })
// })

// app.listen(81)

// geo.createSuggestions({ latitude: 59.944595, longitude: 30.312003 })
//     .then(data => {
//         console.log(data.length)
//     })
//     .catch(err => {
//         console.log(err)
//     })

