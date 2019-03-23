const request = require('request')
const cheerio = require('cheerio')
const geo = require('./geo')
const db = require('./db')
require('colors')

const monthFromRussian = (month) => {
    switch(month.substr(0, 3)) {
        case 'апр':
            return 'Apr'
        case 'мар':
            return 'Mar'
        case 'июн':
            return 'Jun'
        case 'июл':
            return 'Jul'
        case 'мая':
            return 'May'
        case 'ноя':
            return 'Nov'
        case 'окт':
            return 'Oct'
        case 'дек':
            return 'Dec'
        case 'сен':
            return 'Sep'
        default:
            console.log(`${month}`.red)
            return 'Unknown'
    }
}

function parseOnePageTicketLand(url) {
    return new Promise((resolve, reject) => {
        request.get(url, (err, data) => {
                if (err !== null) {
                    console.log(`${err}`.red)
                    reject()
                    return
                }
                let $ = cheerio.load(data.body)
                let labels = $('.showname').map((index, elem) => elem.children[1].attribs.title).toArray()
                let dates = $('.cell .date').map((index, elem) => elem.children[0].data.trim()).toArray()
                let times = $('.cell.date > .times').map((index, elem) => elem.children.length == 1 ? elem.children[0].data : elem.children[2].data ).toArray().map((elem) => elem.trim().split('\n')[1].trim())
                let addrs = $('.cell.name').map((index, elem) => elem.children[2].attribs.title).toArray()

                let posters = $('.venue_img').map((_, elem) => elem.attribs.src).toArray().map(str => 'https:' + str)
                const amount = labels.length
                let schedule = []
                for (let i = 0; i != amount; ++i) {
                    const month = monthFromRussian(dates[i].split(' ')[1])
                    const day = dates[i].split(' ')[0]
                    const dateStr = month + ' ' + day + ' ' + '2019' + ' ' + times[i]
                    const date = new Date(dateStr)
                    schedule.push({
                        label: labels[i],
                        date: date,
                        address: addrs[i],
                        poster: posters[i],
                        artists: []
                    })
                }
                console.log('Loaded'.green)
                resolve(schedule)
            })
    })
}

function parseSpbTicketLand() {
    return new Promise((resolve, reject) => {        
        const urls = [
            'https://spb.ticketland.ru/concert/?text=&g=13656&page=1',
            'https://spb.ticketland.ru/concert/page-2/?text=&g=13656&page=2',
            'https://spb.ticketland.ru/concert/page-3/?text=&g=13656&page=3',
            'https://spb.ticketland.ru/concert/page-4/?text=&g=13656&page=4',
            'https://spb.ticketland.ru/concert/page-5/?text=&g=13656&page=5',
            'https://spb.ticketland.ru/concert/page-6/?text=&g=13656&page=6',
            'https://spb.ticketland.ru/concert/page-7/?text=&g=13656&page=7',
            'https://spb.ticketland.ru/concert/page-8/?text=&g=13656&page=8'
        ]

        let proms = urls.map(url => parseOnePageTicketLand(url))
        Promise.all(proms).then(data => {
            let full = []
            data.forEach(elem => full = full.concat(elem))
            resolve(full)
        })
    })
}

function loadPage(url) {
    return new Promise((resolve, reject) => {
        request.get(url, (err, data) => {
            if (err !== null) {
                console.log(err)
                reject()
            } else {
                let $ = cheerio.load(data.body)
                let events = $('.event.js-ec-impression').map((index, elem) => {
                    return JSON.parse(elem.children[0].parent.attribs['data-ec-item'])
                }).toArray()

                let schedule = []
                for (let i = 0; i != events.length; ++i) {
                    schedule.push({
                        label: events[i].eventName,
                        date: new Date(events[i].date),
                        address: events[i].venueName,
                        poster: events[i].image,
                        artists: []
                    })
                }

                resolve(schedule)
            }
        })
    })
}

function parseSpbKassir() {
    return new Promise((resolve, reject) => {
        loadPage('https://spb.kassir.ru/bilety-na-koncert')
            .then((data) => {
                resolve(data)
            })
    })
}

async function job() {
    let data = []
    let kassir = await parseSpbKassir()
    let ticketland = await parseSpbTicketLand()
    data = data.concat(kassir, ticketland)

    let uniqueAddresses = new Set()
    data.forEach(elem => {
        if (!(elem.address in uniqueAddresses))
            uniqueAddresses.add(elem.address)
    })
    let usefull = new Set()
    let addressMapper = {}

    async function asyncForEach(array, callback) {
        for (let i = 0; i != array.length; ++i) {
            await callback(array[i])
        }
    }

    const runner = async () => {
        await asyncForEach(Array.from(uniqueAddresses), async address => {
            try {
                const possible = await geo.findPlaces(address, '59.944595', '30.312003')
                console.log(`Loaded ${possible.length}`.cyan)
                if (possible.length > 0) {
                    let index = 0
                    while (index < possible.length && possible[index].distance === undefined)
                        index += 1
                    for (let i = index + 1; i != possible.length; ++i) {
                        if (possible[i].distance !== undefined && possible[i].distance < possible[index].distance)
                            index = i
                    }
                    usefull.add(address)
                    addressMapper[address] = possible[index]
                }
            } catch (err) {
                console.log(`${err}`.red)
            }
        })
    }
    await runner()
    console.log(`We can use ${usefull.size} of ${uniqueAddresses.size}`)

    let goodData = []
    data.forEach(row => {
        if (usefull.has(row.address)) {
            let now = row
            now.location = {}
            now.location.latitude = addressMapper[row.address].position[0]
            now.location.longitude = addressMapper[row.address].position[1]
            now.isActive = false
            goodData.push(now)
        }
    })

    await db.dropConcerts()
    const inserted = await db.addConcerts(goodData)
    console.log(`Was inserted ${inserted}`)
    db.close()
}

job()