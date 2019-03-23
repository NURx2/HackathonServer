class Connection {
    constructor(socket_) {
        this.socket = socket_
        this.authenticated = false
    }
}

exports.Connection = Connection