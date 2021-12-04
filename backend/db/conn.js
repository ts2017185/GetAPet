const mongoose = require('mongoose')

async function main() {
    await mongoose.connect(process.env.DB_URL)
    console.log('You are connected with Mongoose!')
}

main().catch((err) => console.log(err))

module.exports = mongoose