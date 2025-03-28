// errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err.message);

    // Default status code (500 - Internal Server Error)
    let statusCode = err.status || 500;
    let message = err.message || "Something went wrong!";

    // Custom error handling for specific cases
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(", ");
    } else if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token. Please log in again.";
    } else if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Session expired. Please log in again.";
    }

    res.status(statusCode).json({
        success: false,
        error: message,
    });
};

module.exports = errorHandler;
