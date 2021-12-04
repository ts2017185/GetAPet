const UserModel = require('../models/User')

async function save(user) {
    return UserModel.create(user)
}

async function findOne(query, projection, options) {
    return UserModel.findOne(query, projection, options)
}

async function findByIdAndUpdate(id, data) {
    return UserModel.findByIdAndUpdate(id, data, { new: true })
}

module.exports = {
    findOne,
    save,
    findByIdAndUpdate
}