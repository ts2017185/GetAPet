const {isString} = require('class-validator')
const {ValidationException} = require('../exceptions/Validation.exception');

function UserValidationMiddleware (req, res, next) {
    if (!isString(req.body.name)) {
        throw new ValidationException('You must enter a name!')
    }
    return true
}

module.exports = UserValidationMiddleware
