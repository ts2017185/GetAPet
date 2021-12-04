const jwt = require("jsonwebtoken");

const createUserToken = async(user) => {
    const token = jwt.sign(
        // payload data
        {
            name: user.name,
            id: user._id,
        },
        "nossosecret"
    );

    return {
        message: "You are authenticated!",
        token: token,
        userId: user._id,
    }
};

module.exports = createUserToken;
