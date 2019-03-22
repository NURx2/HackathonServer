const MongoClient = require('mongodb').MongoClient;
const User = require('./data/User').User

function getUser(login, password) {
    return db.collection.find({ login : login, password : password});
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

let isInitialized = false;
let db;


MongoClient.connect('mongodb://hack:hackspb123@ds044979.mlab.com:44979/spbdb', function (err, database) {
    if (err) {
        return console.log(err);
    }
    isInitialized = true;
    db = database;
});