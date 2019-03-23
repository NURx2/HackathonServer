class Connection {
    constructor(socket_) {
        this.socket = socket_
        this.authenticated = false
        this.userId = undefined
    }
}

exports.Connection = Connection