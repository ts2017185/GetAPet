require('custom-env').env(true)
const express = require('express')
const cors = require('cors')

const app = express()

// config JSON response
app.use(express.json())

// solve CORS
app.use(cors({ origin: 'http://localhost:3000', allowedHeaders: ['Content-Type', 'Authorization'] }))

// public folder for images
app.use(express.static('public'))

// routes
// put all the routes in a unic file
app.use('/pets', require('./routes/PetRoutes'))
app.use('/users', require('./routes/UserRoutes'))

// error handler
app.use((error, req, res, next) => {
    console.log(error)
    if (!error.status) {
        error.status = 500
    }
    res.status(error.status).json({ message: error.message, type: error.constructor.name, stack: error.stack })
})

app.listen(5000, () => {
    console.log('Running at port 5000')
})