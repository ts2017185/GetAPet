const mongoose = require('mongoose')

async function main() {
    await mongoose.connect('mongodb+srv://admin:123@clustergetapet.rkoab.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
    console.log('You are connected with Mongoose!')
}

main().catch((err) => console.log(err))

module.exports = mongoose