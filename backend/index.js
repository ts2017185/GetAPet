const express = require('express')
    //const cors = require('cors')

const app = express()

// Config JSON response
app.use(express.json())

// Solve CORS
const cors = require('cors')
app.use(cors({ origin: 'http://localhost:3000' }))

// Public folder for images
app.use(express.static('public'))

// Routes
// Unificar rotas em arquivo unico
const PetRoutes = require('./routes/PetRoutes')
const UserRoutes = require('./routes/UserRoutes')

app.use('/pets', PetRoutes)
app.use('/users', UserRoutes)

app.listen(5000, () => {
    console.log('Running at port 5000')
})