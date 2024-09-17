"use strict";

const httpStatus = require("http-status-codes");
const { Passport } = require("passport");
const User = require("../models/user"),
passport = require("passport"),
jsonWebToken = require("jsonwebtoken"),
getUserParams = body => {
    return {
        firstName: body.firstName.trim(),
        secondName: body.secondName.trim(),
        email:body.email.trim().toLowerCase(),
        password: body.password,
    };
  };


const home = (req,res,next) => {
    res.render("users/home");
};
const index = (req,res,next) => {
    User.find()
    .then(users => {
        res.locals.users = users;
        next();
    })
    .catch(error => {
        req.flash("error", "Error fetching users. Please try again later.");
    });
};

const indexView = (req,res) =>{
    res.render("users/index");
};
const newUser = (req,res,next) => {
    res.render("users/new");
};

const create = (req, res, next) => {
    if (req.skip) return next();
    const newUser = new User(getUserParams(req.body));
    User.register(newUser, req.body.password, (error, user) => {
      if (error) {
        req.flash("error", `Failed to create user account because: ${error.message}.`);
        res.locals.redirect = "/users/register";
        next();
      } else {
        req.flash("success", `${user.firstName}'s account created successfully!`);
        res.locals.redirect = "/users/index";
        next();
      }
    });
  };

const redirectView = (req,res,next) =>{
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
};
const show = (req,res, next) => {
    let userId = req.params.id;
    User.findById(userId)
    .then(user => {
        res.locals.user = user;
        next();
    })
    .catch (error => {
        req.flash("error", "Error fetching user details. Please try again later.");
        next(error);
    });
};

const showView = (req, res) => {
    res.render("users/show");
};

const edit = (req,res,next) => {
    let userId = req.params.id;
    User.findById(userId)
    .then(user => {
        res.render("users/edit",{
        user: user
        });
    })
    .catch(error => {
        req.flash("error", "Error fetching user details for editing. Please try again later.");
        next(error);
    });
};

const update = (req, res, next) => {
    const userId = req.params.id;
    const userParams = getUserParams(req.body);
    User.findByIdAndUpdate(userId, { $set: userParams }, { new: true })
      .then(user => {
        req.flash("success", `${user.firstName}'s account updated successfully!`);
        res.locals.redirect = `/users/${userId}`;
        res.locals.user = user;
        next();
      })
      .catch(error => {
        req.flash("error", "Error updating user details. Please try again later.");
        next(error);
      });
  };

const deleteUser = (req, res, next) =>{
    let userId = req.params.id;
    User.findByIdAndDelete(userId)
    .then(() => {
        res.locals.redirect = "/users/index";
        next();
    })
    .catch(error => {
        req.flash("error", "Error deleting user. Please try again later.");
        next();
    })
};

const login = (req,res) =>{ 
    res.render("/");
};


 const authenticate = passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: "Failed to login.",
    successRedirect: "/users/home",
    successFlash: "Logged in!"
  });


 const logout = (req, res, next) => {
    req.logout(err => {
      if (err) {
        req.flash("error", "Error logging out. Please try again later.");
        return next(err);
      }
      req.flash("success", "You have been logged out!");
      res.locals.redirect = "/";
      next();
    });
  };

const assignTokens = (req, res, next) => {
  passport.authenticate("local", (errors, user) => {
    if (errors) {
        req.flash("error", "Authentication error. Please try again.");
        return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Could not authenticate user."
      });
    }
    if (user) {
      const signedToken = jsonWebToken.sign(
        { data: user._id },
        process.env.JWT_SECRET, // Use environment variable for secret
        { expiresIn: '1d' } // Token expiration (1 day)
      );
      res.json({
        success: true,
        token: signedToken
      });
    } else {
        req.flash("error", "Authentication failed. Please check your credentials.");
        res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Could not authenticate user."
      });
    }
  })(req, res, next);
};

const verifyJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"
  
    if (token) {
      jsonWebToken.verify(token, process.env.JWT_SECRET, (errors, payload) => {
        if (errors) {
            req.flash("error", "Token verification failed. Please login again.");
            return res.status(httpStatus.UNAUTHORIZED).json({
            error: true,
            message: "Cannot verify API token."
          });
        }
        if (payload) {
          User.findById(payload.data)
            .then(user => {
              if (user) {
                next();
              } else {
                req.flash("error", "No user account found.");
                res.status(httpStatus.FORBIDDEN).json({
                    error: true,
                    message: "No user account found."
                });
              }
            })
            .catch(err => {
              logger.error(`Error finding user: ${err.message}`);
              res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                error: true,
                message: "Internal server error."
              });
            });
        }
      });
    } else {
        req.flash("error", "No token provided.");
        res.status(httpStatus.UNAUTHORIZED).json({
        error: true,
        message: "Provide token."
      });
    }
  };


module.exports = {
    home,index,indexView,newUser,create,redirectView,show,showView,edit,update,
    deleteUser,login,authenticate,logout,assignTokens, verifyJWT}




