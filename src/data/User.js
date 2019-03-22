const jwt = require('jsonwebtoken')
require('dotenv').config()

class User {
    constructor() {
        this.name = undefined
        this.surname = undefined
        this.token = undefined
        this.login = undefined
        this.userType = undefined
    }

    logged() {
        if (this.login === undefined || this.token === undefined) return false
        try {
            let verif = jwt.verify(this.token, process.env.secret)
            if (verif.login === this.login)
                return true
            return false
        } catch (err) {
            console.log(err)
            return false
        }
        return true
    }

    getUserId() {
        try {
            let decoded = jwt.verify(this.token, process.env.secret)
            return decoded.id
        } catch (_) {
            return undefined
        }
    }
}

exports.User = User