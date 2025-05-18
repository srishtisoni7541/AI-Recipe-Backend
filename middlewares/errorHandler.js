const errorHandler = (err, req, res, next) => {
    console.error("Error:", err.message);

    // Default status code (500 - Internal Server Error)
    let statusCode = err.status || 500;
    let message = err.message || "Something went wrong!";

    // Handle Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(", ");
    } 
    // Handle MongoDB Duplicate Key Error
    else if (err.code === 11000) {
        statusCode = 400;
        message = "Email already exists. Please use a different email.";
    } 
    // Handle JWT Errors
    else if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token. Please log in again.";
    } 
    else if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Session expired. Please log in again.";
    }

    // Send Response
    if (!res.headersSent) {
        res.status(statusCode).json({
            success: false,
            error: message,
        });
    } else {
        next(err);
    }
};

module.exports = errorHandler;
