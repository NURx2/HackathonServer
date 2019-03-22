const User = require('./data/User').User

exports.getUser = function(login, password) {
    return new Promise((resolve, reject) => {
        if (login === 'demo' && password === 'demo') {
            let user = new User()
            user.login = 'demo'
            user.password = 'demo'
            user.userType = 'user'
            user.name = 'Debil'
            user.surname = 'Durak'
            resolve(user)
        }
        reject()
    })
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