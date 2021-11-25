const jwt = require("jsonwebtoken");

// middleware to validate token
const checkToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    console.log(authHeader)
    if (!token) return res.status(401).json({ message: "Access denied!" });

    try {
        const verified = jwt.verify(token, "nossosecret");
        req.user = verified;
        next(); // to continue the flow
    } catch (err) {
        res.status(400).json({ message: "Token is invalid!" });
    }
};

module.exports = checkToken;