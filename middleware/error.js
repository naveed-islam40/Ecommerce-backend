const ErrorHandler = require("../utils/ErrorHandler")

module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "Internal server error"

    // wrong mongodb url error 


    if (error.name === "CastError") {
        const message = `Resource not found, Invalid ${error.path}`
        error = new ErrorHandler(message, 400)
    }

    // mongoose duplicate key error

    if (error.code === 11000) {
        const message = `Duplicate ${Object.keys(error.keyValue)} entered, please try with unique Email`
        error = new ErrorHandler(message, 400)
    }

    // mongoose duplicate key error
    if (error.name === "jasonWebTokenError") {
        const message = `Invalid Token`
        error = new ErrorHandler(message, 400)
    }

    // mongoose duplicate key error
    if (error.name === "TokenExpiredError") {
        const message = `Token has been Expired`
        error = new ErrorHandler(message, 400)
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message
    })
}