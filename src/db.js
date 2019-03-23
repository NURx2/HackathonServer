const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID
const User = require('./data/User').User

let isInitialized = false;
let db;
let client

exports.getUser = function getUser(login, password) {
    return db.collection('users').findOne({ login : login, password : password });
}

exports.getUserById = function getUser(userId) {
    return db.collection('users').findOne({ _id: new ObjectID(userId) });
}

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

/**
 * @param {User} user - for whom we need to load concerts
 */

exports.getUserConcerts = function(user) {
    return new Promise((resove, reject) => {
        if (user.login === demo) {
            resolve()
        }
        reject()
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

exports.close = () => {
    client.close()
}

MongoClient.connect('mongodb://hack:hackspb123@ds044979.mlab.com:44979/spbdb', { useNewUrlParser : true }, function (err, client_) {
    if (err) {
        return console.log(err);
    }
    isInitialized = true;
    client = client_;
    db = client.db('spbdb');
});