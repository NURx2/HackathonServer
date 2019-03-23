require('dotenv').config()
require('colors')
const request = require('request')
const fs = require('fs')

class HERERequestFactory {
    constructor() {
        this.cur = ''
    }
    
    base(begin) {
        this.cur = `${begin}?`
    }

    coords(coord) {
        this.cur += `&c=${coord.latitude},${coord.longitude}`
    }

    field(name, value) {
        this.cur += `&${name}=${value}`
    }

    build() {
        return this.cur
    }
}
const reqFactory = new HERERequestFactory()

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

const ImageType = {
    PNG: 0,
    JPEG: 1,
    GIF: 2,
    BMP: 3,
    PNG8: 4,
    SVG: 5
}
const downloadImage = function(uri){
    return new Promise((resolve, reject) => {
        request.head(uri, function (err, res, body) {
            if (err) {
                reject()
                return
            }
            resolve(request(uri)) /*.pipe(fs.createWriteStream(filename)).on('close', callback)*/
        })
    })
}
function loadMap(coords, width, height, zoom, imageType = ImageType.JPEG) {
    return new Promise((resolve, reject) => {
        reqFactory.base('https://image.maps.api.here.com/mia/1.6/mapview')
        reqFactory.field('w', width)
        reqFactory.field('h', height)
        reqFactory.field('z', zoom)
        reqFactory.field('f', imageType)
        reqFactory.field('app_id', process.env.app_id)
        reqFactory.field('app_code', process.env.app_code)
        reqFactory.coords(coords)
        downloadImage(reqFactory.build())
            .then(stream => {
                resolve(stream)
            })
            .catch(err => reject(err))
        // downloadImage(reqFactory.build(), "some.jpg", () => {
        //     console.log('Finished')
        // })
        // request.get(reqFactory.build(), (err, data, body) => {
        //     if (err) {
        //         console.log(err)
        //         reject()
        //     } else {
        //     }
        // })
    })
}

exports.findPlaces = findPlaces
exports.createSuggestions = createSuggestions
exports.loadMap = loadMap
