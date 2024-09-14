"use strict";

const httpStatus = require("http-status-codes");

// Middleware to log errors
const logErrors = (error, req, res, next) => {
  console.error('Error stack:', error.stack);
  next(error); // Pass the error to the next middleware
};

// Middleware to handle 404 errors (page not found)
const respondNoResourceFound = (req, res) => {
  let errorCode = httpStatus.NOT_FOUND;
  res.status(errorCode);
  res.render("layout", { 
    title: "404 Not Found",
    message: `${errorCode} | The page you are looking for does not exist!`,
    body: `<p>${errorCode} | The page you are looking for does not exist!</p>`
  });
};

// Middleware to handle internal server errors
const respondInternalError = (error, req, res, next) => {
  let errorCode = httpStatus.INTERNAL_SERVER_ERROR;
  console.error('Error occurred:', error.stack);
  res.status(errorCode);
  res.render("layout", { 
    title: "500 Internal Server Error",
    message: `${errorCode} | Sorry, our application is experiencing a problem!`,
    body: `<p>${errorCode} | Sorry, our application is experiencing a problem!</p>`
  });
};

// Middleware to handle all other errors
const handleAllErrors = (error, req, res, next) => {
  let errorCode = httpStatus.INTERNAL_SERVER_ERROR;
  console.error('Unexpected error:', error.stack);
  res.status(errorCode);
  res.render("layout", { 
    title: "500 Internal Server Error",
    message: `${errorCode} | An unexpected error occurred!`,
    body: `<p>${errorCode} | An unexpected error occurred!</p>`
  });
};

const handleDatabaseError = (error, req, res, next) => {
  if (error.name === 'MongoError') {
    res.status(httpStatus.INTERNAL_SERVER_ERROR);
    res.render("error", { 
      message: `Database error: ${error.message}` 
    });
  } else {
    next(error);
  }
};

module.exports = { logErrors, respondInternalError, respondNoResourceFound, handleAllErrors,handleDatabaseError };
