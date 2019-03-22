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
            if (verif === this.login)
                return true
            return true
        } catch (err) {
            console.log(err)
            return false
        }
        return true
    }
}

exports.User = User