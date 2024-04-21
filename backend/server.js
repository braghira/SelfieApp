// config method will attach .env variables to the "process" global variable
require('dotenv').config()

const os = require('os')
const express = require('express')
const workoutRoutes = require('./routes/workouts')
const mongoose = require('mongoose')

const mongouri = getMongoURI()

function getMongoURI() {
    let uri;
    if (isDisiMachine()) {
        console.log('Siamo su una macchina del DISI')
        uri = process.env.disiDB_URI
    } else {
        console.log('Non siamo su una macchina del DISI')
        uri = process.env.privateDB_URI
    }
    return uri;
}

function isDisiMachine() {
    const hostname = os.hostname()
    console.log('Hostname:', hostname)
    // Il regex corrisponde a nomi di host che sono stringhe esadecimali di 12 caratteri
    const disiRegex = /^[0-9a-f]{12}$/
    return disiRegex.test(hostname)
}

// express app
const app = express()

// middleware
app.use(express.json())

app.use((req, res, next) => {
    console.log('path:', req.path, 'method:', req.method)
    next()
})

// routes
app.use('/api/workouts', workoutRoutes)

// connect to db
mongoose.connect(mongouri, {dbName: 'SelfieDB'})
    .then(() => {
        // listen for requests
        app.listen(process.env.PORT, () => {
            console.log(`DB connected and listening on port ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log(error)
    })
