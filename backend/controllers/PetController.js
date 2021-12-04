const Pet = require('../models/Pet')

// helpers
const getUserByToken = require('../helpers/get-user-by-token')
const getToken = require('../helpers/get-token')
const ObjectId = require('mongoose').Types.ObjectId

module.exports = class PetController {
    // create a pet
    static async create(req, res) {
        const name = req.body.name
        const age = req.body.age
        const description = req.body.description
        const weight = req.body.weight
        const color = req.body.color
        const images = req.files
        const available = true

        console.log(images)

        // pet's validations
        if (!name) {
            res.status(422).json({ message: 'You must enter a name!' })
            return
        }

        if (!age) {
            res.status(422).json({ message: 'You must inform the age!' })
            return
        }

        if (!weight) {
            res.status(422).json({ message: 'You must inform the weight!' })
            return
        }

        if (!color) {
            res.status(422).json({ message: 'You must inform the color!' })
            return
        }

        if (!images) {
            res.status(422).json({ message: 'You must upload a picture!' })
            return
        }

        // get user
        const token = getToken(req)
        const user = await getUserByToken(token)

        // create pet
        const pet = new Pet({
            name: name,
            age: age,
            description: description,
            weight: weight,
            color: color,
            available: available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone,
            },
        })

        images.map((image) => {
            pet.images.push(image.filename)
        })

        try {
            const newPet = await pet.save()

            res.status(201).json({
                message: 'Successfully registered pet!',
                newPet: newPet,
            })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

    // get all registered pets
    static async getAll(req, res) {
        const pets = await Pet.find().sort('-createdAt')

        res.status(200).json({
            pets: pets,
        })
    }

    // get all user pets
    static async getAllUserPets(req, res) {
        // get user
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({ 'user._id': user._id })

        res.status(200).json({
            pets,
        })
    }

    // get all user adoptions
    static async getAllUserAdoptions(req, res) {
        // get user
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({ 'adopter._id': user._id })

        res.status(200).json({
            pets,
        })
    }

    // get a specific pet
    static async getPetById(req, res) {
        const id = req.params.id

        // check if ID is valid
        if (!ObjectId.isValid(id)) {
            res.status(422).json({ message: 'Incorrect ID!' })
            return
        }

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: 'Pet not found!' })
            return
        }

        res.status(200).json({
            pet: pet,
        })
    }

    // remove a pet
    static async removePetById(req, res) {
        const id = req.params.id

        // check if ID is valid
        if (!ObjectId.isValid(id)) {
            res.status(422).json({ message: 'Incorrect ID!' })
            return
        }

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: 'Pet not found!' })
            return
        }

        // check if user registered this pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() != user._id.toString()) {
            res.status(404).json({
                message: 'There was a problem processing your request, please try again later!',
            })
            return
        }

        await Pet.findByIdAndRemove(id)

        res.status(200).json({ message: 'Pet successfully removed!' })
    }

    // update a pet
    static async updatePet(req, res) {
        const id = req.params.id
        const name = req.body.name
        const age = req.body.age
        const description = req.body.description
        const weight = req.body.weight
        const color = req.body.color
        const images = req.files
        const available = req.body.available

        const updateData = {}

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: 'Pet not found!' })
            return
        }

        // check if user registered this pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() != user._id.toString()) {
            res.status(404).json({
                message: 'There was a problem processing your request, please try again later!',
            })
            return
        }

        // pet's validations
        if (!name) {
            res.status(422).json({ message: 'You must enter a name!' })
            return
        } else {
            updateData.name = name
        }

        if (!age) {
            res.status(422).json({ message: 'You must inform the age!' })
            return
        } else {
            updateData.age = age
        }

        if (!weight) {
            res.status(422).json({ message: 'You must inform the weight!' })
            return
        } else {
            updateData.weight = weight
        }

        if (!color) {
            res.status(422).json({ message: 'You must inform the color!' })
            return
        } else {
            updateData.color = color
        }

        if (!images) {
            res.status(422).json({ message: 'You must upload a picture!' })
            return
        } else {
            updateData.images = []
            images.map((image) => {
                updateData.images.push(image.filename)
            })
        }

        if (!available) {
            res.status(422).json({ message: 'You must inform the status!' })
            return
        } else {
            updateData.available = available
        }

        updateData.description = description

        await Pet.findByIdAndUpdate(id, updateData)

        res.status(200).json({ pet: pet, message: 'Successfully updated pet!' })
    }

    // schedule a visit
    static async schedule(req, res) {
        const id = req.params.id

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        // check if user owns this pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        console.log(pet)

        if (pet.user._id.equals(user._id)) {
            res.status(422).json({
                message: 'You cannot schedule a visit with your own pet!',
            })
            return
        }

        // check if user has already adopted this pet
        if (pet.adopter) {
            if (pet.adopter._id.equals(user._id)) {
                res.status(422).json({
                    message: 'You already have scheduled a visit for this pet!',
                })
                return
            }
        }

        // add user to pet
        pet.adopter = {
            _id: user._id,
            name: user.name,
            image: user.image,
        }

        console.log(pet)

        await Pet.findByIdAndUpdate(pet._id, pet)
        // send pet's owner phone number for contact
        res.status(200).json({
            message: `The visit was successfully scheduled, please contact ${pet.user.name} on the phone number: ${pet.user.phone}`,
        })
    }

    // conclude a pet adoption
    static async concludeAdoption(req, res) {
        const id = req.params.id

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        pet.available = false

        await Pet.findByIdAndUpdate(pet._id, pet)

        res.status(200).json({
            pet: pet,
            message: `Congratulations! Adoption cycle completed successfully!`,
        })
    }
}
