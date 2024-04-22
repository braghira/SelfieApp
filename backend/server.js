// config method will attach .env variables to the "process" global variable
require('dotenv').config()

const express = require('express')
const workoutRoutes = require('./routes/workouts')
const mongoose = require('mongoose')
const utils = require('./utils/environmentDetector')

const mongouri = utils.getMongoURI()

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
