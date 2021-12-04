const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

const User = require('../models/User')

// helpers
const getUserByToken = require('../helpers/get-user-by-token')
const getToken = require('../helpers/get-token')
const createUserToken = require('../helpers/create-user-token')
const { imageUpload } = require('../helpers/image-upload')
const ValidationException = require('../exceptions/Validation.exception');
const WrongCredentialsException = require('../exceptions/WrongCredentials.exception')
const UserRepository = require('../repository/User.repository')
const { isString, minLength } = require('class-validator');
const { findByIdAndUpdate } = require('../models/User')

/**
 * this function is responsible for register an user
 * 
 * @param body
 * @param {string} body.name
 * @param {string} body.email
 * @param {string} body.phone
 * @param {string} body.password
 * @param {string} body.confirmpassword
 *
 * @returns {Promise<{message: string, userId: *, token: *|undefined}>}
 *
 */

async function register(body) {
    const name = body.name
    const email = body.email
    const phone = body.phone
    const password = body.password
    const confirmpassword = body.confirmpassword

    // user's validations when registering a new user
    if (!isString(name)) {
        throw new ValidationException('You must enter a name!')
    }

    if (!email) {
        throw new ValidationException('You must enter a email!')
    }

    if (!phone) {
        throw new ValidationException('You must enter a phone number!!')
    }

    if (!password) {
        throw new ValidationException('You must enter a password!!')
    }

    if (!confirmpassword) {
        throw new ValidationException('Password confirmation is mandatory.!')
    }

    if (password != confirmpassword) {
        throw new ValidationException('Password and confirmation must match.!')
    }

    // check if user exists
    const userExists = await UserRepository.findOne({ email: email })

    if (userExists) {
        throw new ValidationException('Please use another email!')
    }

    // create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = await UserRepository.save({
        name: name,
        email: email,
        phone: phone,
        password: password,
    })

    return await createUserToken(newUser)
}
async function deleteUser(id, image) {

    var testImage = path.resolve(__dirname, "..", "public/images/users", image || "huhu.txt")

    if (fs.existsSync(testImage)) {
        fs.unlinkSync(testImage)

    }
    return UserRepository.findByIdAndUpdate(id, { name: '', email: '', phone: '', password: '', image: '' })

}

class UserController {
    
    // user's validations when a user try to login
    static async login(req, res) {
        const email = req.body.email
        const password = req.body.password

        if (!email) {
            res.status(422).json({ message: 'You must enter an email!' })
            return
        }

        if (!password) {
            res.status(422).json({ message: 'You must enter a password!' })
            return
        }

        // check if user exists
        const user = await User.findOne({ email: email })

        if (!user) {
            return res
                .status(422)
                .json({ message: 'There is no registered user with this email!' })
        }

        // check if password match, the seccond piace of code didn't work well 
        const checkPassword = password == user.password //await bcrypt.compare(password, user.password)
                                                        
        if (!checkPassword) {
            throw new WrongCredentialsException("Password incorrect")
        }

        return await createUserToken(user)
    }

    static async checkUser(req, res) {
        let currentUser

        console.log(req.headers.authorization)

        if (req.headers.authorization) {
            const token = getToken(req)
            const decoded = jwt.verify(token, 'nossosecret')

            currentUser = await User.findById(decoded.id)

            currentUser.password = undefined
        } else {
            currentUser = null
        }

        res.status(200).send(currentUser)
    }

    static async getUserById(req, res) {
        const id = req.params.id

        const user = await User.findById(id)

        if (!user) {
            res.status(422).json({ message: 'User not found!' })
            return
        }

        res.status(200).json({ user })
    }

    static async editUser(req, res) {

        let user = req.user

        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const confirmpassword = req.body.confirmpassword

        let image = ''

        if (req.file) {
            image = req.file.filename
        }

        var testImage = path.resolve(__dirname, "..", "public/images/users", req.user.image)

        if (fs.existsSync(testImage)) {
            fs.unlinkSync(testImage)

        }

        // validations
        if (!name) {
            res.status(422).json({ message: 'You must enter a name!' })
            return
        }

        user.name = name

        if (!email) {
            res.status(422).json({ message: 'You must enter an email!' })
            return
        }

        if (user.email !== email && userExists) {
            res.status(422).json({ message: 'Please use another email!' })
            return
        }

        user.email = email

        if (image) {
            const imageName = req.file.filename
            user.image = imageName
        }

        if (!phone) {
            res.status(422).json({ message: 'You must enter a phone number!' })
            return
        }

        user.phone = phone

        // check if password match
        if (password != confirmpassword) {
            res.status(422).json({ error: 'Passwords do not match.' })

        // change password
        } else if (password == confirmpassword && password != null) {
            
        // creating password
        const reqPassword = req.body.password
        const passwordHash = await bcrypt.hash(reqPassword, salt)
        user.password = password
        }

        try {
            // returns updated data
            const updatedUser = await User.findOneAndUpdate({ _id: user._id }, { $set: user }, { new: true }, )
            res.json({
                message: 'User updated successfully!',
                data: updatedUser,
            })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }
}

module.exports = {
    UserController,
    register,
    deleteUser
}