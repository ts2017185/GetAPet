class WrongCredentialsException extends Error {
    constructor(message) {
        super(message)
        this.status = 422
    }
}

module.exports = WrongCredentialsException
