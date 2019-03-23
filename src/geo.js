require('dotenv').config()
require('colors')
const request = require('request')

exports.findPlaces = function(place, latitude, longitude) {
    return new Promise((resolve, reject) => {
        request.get(`https://places.cit.api.here.com/places/v1/` + 
            `autosuggest?at=${latitude},${longitude}&q=${encodeURI(place)}&app_id=${process.env.app_id}&app_code=${process.env.app_code}`, (err, info) => {
                if (err !== null) reject(err)
                const data = JSON.parse(info.body).results
                if (data === undefined) { 
                    reject('Not found')
                    return
                }
                resolve(data)
            })
    })
}