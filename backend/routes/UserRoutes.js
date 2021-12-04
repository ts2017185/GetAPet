const router = require("express").Router();
const { Request, Response, NextFunction } = require('express')

const { UserController, register, deleteUser } = require("../controllers/UserController");


// middlewares
const verifyToken = require("../helpers/check-token");
const { imageUpload } = require("../helpers/image-upload");
const userMiddleware = require('../middlewares/User.middleware')

// routes
router.post("/register", reg);
router.post("/login", login);
router.get("/checkuser", UserController.checkUser);
router.get("/:id", UserController.getUserById);
router.delete("/delete", verifyToken, userMiddleware, del);

router.patch(
    "/edit/:id",
    verifyToken,
    imageUpload.single("image"),
    userMiddleware,
    UserController.editUser
);

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
async function reg(req, res, next) {
    try {
        res.status(200).json(await register(req.body))
    } catch (e) {
        // res.status(e.status || 500).json({message: e.message, type: e.constructor.name, stack: e.stack})
        next(e, req, res, next)
    }
}

async function login(req, res) {
    try {
        res.status(200).json(await UserController.login(req))
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message, type: e.constructor.name })
    }
}

async function del(req, res, next) {
    try {
        res.status(200).json(await deleteUser(req.token.id, req.user.image))
    } catch (e) {
        // res.status(e.status || 500).json({message: e.message, type: e.constructor.name, stack: e.stack})
        next(e, req, res, next)
    }

}

module.exports = router;