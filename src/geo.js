require('dotenv').config()
require('colors')
const request = require('request')

function findPlaces(place, latitude, longitude) {
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

function loadSuggestions(query, coords) {
    return new Promise((resolve, reject) => {
        request.get(`https://places.demo.api.here.com/places/v1/` +
            `autosuggest?at=${coords.latitude},${coords.longitude}&q=${query}&app_id=${process.env.app_id}&app_code=${process.env.app_code}`,
            (err, loaded) => {
                if (err === null) {
                    const data = JSON.parse(loaded.body).results
                    if (data === undefined) {
                        reject('Server error')
                    } else {
                        resolve(data)
                    }
                } else {
                    reject('Server error')
                }
            })
    })
}

function createSuggestions(coords) {
    return new Promise((resolve, reject) => {
        const queries = [ 'restaurant', 'cafe', 'hookah', 'shop' ]
        let promises = queries.map(q => loadSuggestions(q, coords))
        Promise.all(promises)
            .then(data => {
                let res = []
                data.forEach(arr => res = res.concat(arr))
                res = res.filter(row => (row.distance !== undefined && row.distance <= 1200))
                resolve(res)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
}

exports.findPlaces = findPlaces
exports.createSuggestions = createSuggestions
