const MongoClient = require('mongodb').MongoClient;
const User = require('./data/User').User

let isInitialized = false;
let db;

exports.getUser = function getUser(login, password) {
    return db.collection('users').findOne({ login : login, password : password})
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

MongoClient.connect('mongodb://hack:hackspb123@ds044979.mlab.com:44979/spbdb', { useNewUrlParser: true }, function (err, database) {
    if (err) {
        return console.log(err);
    }
    isInitialized = true;
    db = database.db("spbdb");
});