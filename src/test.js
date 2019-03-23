const geo = require('./geo')

geo.createSuggestions({ latitude: 59.944595, longitude: 30.312003 })
    .then(data => {
        console.log(data.length)
    })
    .catch(err => {
        console.log(err)
    })