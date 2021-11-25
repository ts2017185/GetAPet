const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/User')

// helpers
const getUserByToken = require('../helpers/get-user-by-token')
const getToken = require('../helpers/get-token')
const createUserToken = require('../helpers/create-user-token')
const { imageUpload } = require('../helpers/image-upload')



module.exports = class UserController {
    static async register(req, res) {
        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const confirmpassword = req.body.confirmpassword

        // validations
        if (!name) {
            res.status(422).json({ message: 'You must enter a name!' })
            return
        }

        if (!email) {
            res.status(422).json({ message: 'You must enter a email!' })
            return
        }

        if (!phone) {
            res.status(422).json({ message: 'You must enter a phone number!!' })
            return
        }

        if (!password) {
            res.status(422).json({ message: 'You must enter a password!!' })
            return
        }

        if (!confirmpassword) {
            res.status(422).json({ message: 'Password confirmation is mandatory.!' })
            return
        }

        if (password != confirmpassword) {
            res
                .status(422)
                .json({ message: 'Password and confirmation must match.!' })
            return
        }

        // check if user exists
        const userExists = await User.findOne({ email: email })

        if (userExists) {
            res.status(422).json({ message: 'Please use another email!' })
            return
        }

        // create password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = password //await bcrypt.hash(password, salt)

        // create user
        const user = new User({
            name: name,
            email: email,
            phone: phone,
            password: passwordHash,
        })

        try {
            const newUser = await user.save()

            await createUserToken(newUser, req, res)
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

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

        // check if password match
        const checkPassword = password == user.password //await bcrypt.compare(password, user.password)

        if (!checkPassword) {
            return res.status(422).json({ message: 'Incorrect password!' })
        }

        await createUserToken(user, req, res)
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
        const token = getToken(req)

        //console.log(token);

        const user = await getUserByToken(token)

        // console.log(user);
        // console.log(req.body)
        // console.log(req.file.filename)

        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const confirmpassword = req.body.confirmpassword

        let image = ''

        if (req.file) {
            image = req.file.filename
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

        // check if user exists
        const userExists = await User.findOne({ email: email })

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
            const salt = await bcrypt.genSalt(12)
            const reqPassword = req.body.password

            const passwordHash = await bcrypt.hash(reqPassword, salt)

            user.password = passwordHash
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