const User = require("../models/User");
const {findOne} = require('../repository/User.repository')

// get user by jwt token
async function userMiddleware (req, res, next) {
    const user = await findOne({ _id: req.token.id });
    if (user === null) {
        res.status(404).json({error: 'User dosent exists'})
    }
    req.user = user;
    next();
}

module.exports = userMiddleware;
