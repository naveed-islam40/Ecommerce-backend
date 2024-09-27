const asyncHandler = require("../middleware/asyncHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const isAuthenticated = asyncHandler(async function (req, res, next) {

    const { token } = req.cookies;

    console.log(req.cookies)
    if (!token) {
        return next(new ErrorHandler("Please login to access these resources", 401))
    }

    const decodedData = jwt.verify(token, process.env.SECRET_KEY)
    req.user = await userModel.findById(decodedData.id)
    next()
})

const authorizationRole = (...roles) => {

    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role ${req.user.role} not allowed to access this resource`, 403))
        }
        return next()
    }
}

module.exports = {
    isAuthenticated,
    authorizationRole
}