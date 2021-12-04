class ValidationException extends Error {
    constructor(message) {
        super(message)
        this.status = 422
    }
}

module.exports = ValidationException
