const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID
const User = require('./data/User').User

let isInitialized = false;
let db;
let client

exports.getUser = function getUser(login, password) {
    return db.collection('users').findOne({ login : login, password : password });
}

function getUserById(userId) {
    return db.collection('users').findOne({ _id: new ObjectID(userId) });
}

exports.getUserById = getUserById

exports.addUser = function addUser(login, pass, name, surname, ustype) {
    return new Promise((resolve, reject) => {
        let he = new User();
        he.login = login;
        he.password = pass;
        he.name = name;
        he.surname = surname;
        he.userType = ustype;
        db.collection('users').insert(he, function(err) {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(he);
        });
    });
}

function loadConcert(concertId) {
    console.log('loadConcert with id'.cyan, concertId)
    return db.collection('concerts').findOne({ _id: ObjectID(concertId) })
}

function loadConcertsInfo(concertIds) {
    console.log('loadConcertInfo with', concertIds)
    return new Promise((resolve, reject) => {
        let promises = concertIds.map(id => loadConcert(id))
        Promise.all(promises)
            .then(data => {
                console.log(data.length)
                data = data.filter(row => row != null)
                console.log(data.length)
                data.sort((first, second) => {
                    if (first.date < second.date) return -1
                    if (first.date > second.date) return 1
                    return 0
                })
                console.log(data)
                resolve(data)
            })
            .catch(err => {
                console.log(err)
                reject()
            })
    })    
}

/**
 * @param {User} user - for whom we need to load concerts
 */

exports.getUserConcerts = function(userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const concertIds = (await getUserById(userId)).concerts
            const concerts = await loadConcertsInfo(concertIds)
            resolve(concerts)
        } catch (err) {
            console.log(err)
            reject('Server error')
        }
    })
}

exports.addToSchedule = function addToSchedule(userId, concertId) {
    return new Promise((resolve, reject) => {
        db.collection('users')
            .updateOne({ _id: ObjectID(userId) }, { $addToSet: { concerts: concertId } })
            .then(data => data.result)
            .then(result => {
                if (result.nModified == 0) {
                    resolve('Already existed')
                } else {
                    resolve('Successfylly added to your schedule')
                }
            })
            .catch(err => {
                console.log(err)
                reject()
            })
    })
} 

exports.getAllConcerts = function() {
    return new Promise((resolve, reject) => {
        db.collection('concerts')
            .aggregate([ { $sort: { date: 1 } } ])
            .toArray((err, data) => {
                if (err !== null) {
                    console.log(err)
                    reject('Server error')
                } else {
                    resolve(data)
                }
            })
    })
}

exports.dropConcerts = function() {
    return new Promise((resolve, reject) => {
        db.collection('concerts')
            .deleteMany({})
            .then(() => resolve())
            .catch(err => {
                console.log(err)
                reject()
            })
    })
}

exports.toggleActivation = function(concertId) {
    return new Promise((resolve, reject) => {
        loadConcert(concertId)
            .then(data => {
                if (data === null) {
                    reject('Not found')
                    return
                }
                let newValue = data.isActive ^ 1
                return db.collection('concerts')
                    .updateOne({ _id: ObjectID(data._id) }, { isActive: newValue })
            })
            .then(data => {
                console.log(data)
                resolve()
            })
            .catch(err => reject(err))
    })
}

exports.deleteConcert = function(concertId) {
    return new Promise((resolve, reject) => {
        db.collection('concerts')
            .deleteOne({ _id: ObjectID(concertId) })
            .then(data => {
                resolve(data.result)
            })
            .catch(err => {
                resolve(err)
            })
    })
}

exports.addConcerts = function(data) {
    return new Promise((resolve, reject) => {
        db.collection('concerts')
            .insertMany(data)
            .then(data => {
                resolve(data.insertedCount)
            })
            .catch(err => {
                console.log(err)
                reject()
            })
    })
}

exports.clickEmoji = function(concertId, emojiIndex) {
    console.log(concertId, emojiIndex)
    return new Promise((resolve, reject) => {
        return db.collection('concerts')
            .updateOne({ _id: ObjectID(concertId) }, { $inc: { [`emoji.${emojiIndex - 1}`]: 1 } }, (err, data) => {
                if (err !== null) {
                    console.log(err)
                    reject()
                } else {
                    resolve()
                }
            })
    })
}

exports.getDB = () => db

exports.close = () => {
    client.close()
}

let connectCallback = undefined
exports.onConnect = cb => { connectCallback = cb }

MongoClient.connect('mongodb://hack:hackspb123@ds044979.mlab.com:44979/spbdb', { useNewUrlParser : true }, function (err, client_) {
    if (err) {
        return console.log(err);
    }
    console.log('Databse connected')
    isInitialized = true
    client = client_
    db = client.db('spbdb')
    if (connectCallback !== undefined)
        connectCallback()
});