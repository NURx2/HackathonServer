class Concert {
    constructor() {
        this.name = undefined
        this.artists = [  ] // Artists ids
        this.location = {
            name: undefined,
            coords: {
                longitude: undefined,
                latitude: undefined
            }
        }
        this.isActive = false
        this.date = undefined
        this.concertId = undefined
    }
}

exports.Concert = Concert