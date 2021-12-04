const multer = require("multer");
const path = require("path");

// destination to store image
const imageStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        let folder = "";

        console.log(req)

        if (req.baseUrl.includes('users')) {
            folder = "users";
        } else if (req.baseUrl.includes('pets')) {
            folder = "pets";
        }
        cb(null, `public/images/${folder}/`);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const imageUpload = multer({
    storage: imageStorage,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg)$/)) {
            // upload only png and jpg format
            return cb(new Error("Please send only png or jpg!"));
        }
        cb(undefined, true);
    },
});

module.exports = { imageUpload };