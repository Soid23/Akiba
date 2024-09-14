"use strict";

const dbConnection = require("./config/dbConnect");
const express = require("express"),
app = express(),
router = require("./routes/index"),
layouts = require("express-ejs-layouts"),
mongoose = require("mongoose"),
methodOverride = require("method-override"),
passport = require("passport"), 
cookieParser = require("cookie-parser"),
expressSession = require("express-session"), 
connectFlash = require("connect-flash"),
{ body, validationResult } = require('express-validator'),
dotenv = require ('dotenv').config(),
PORT = process.env.PORT || 3001,
User = require("./models/user");
const { logErrors, respondInternalError, respondNoResourceFound, handleAllErrors, handleDatabaseError } = require("./controllers/errorController");
dbConnection();

app.set("view engine", "ejs");
app.set("token", process.env.TOKEN || "recipeT0k3n");

app.use(express.static("public")); 
app.use(layouts);
app.use(
  express.urlencoded({
  extended: false
    })
    );
app.use(methodOverride("_method", {
  methods: ["POST", "GET"]
  }));
 
 app.use(express.json()); 
 app.use(cookieParser("secret_passcode"))
 app.use(
    expressSession({
      secret: "secret_passcode",
      cookie: {
        maxAge: 4000000
      },
      resave: false,
      saveUninitialized: false
    })
 );

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(connectFlash()); 

app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();  
  res.locals.currentUser = req.user;
  res.locals.flashMessages = req.flash();
  next();
 });
 app.use("/", router);


 app.use(handleDatabaseError);
 app.use(logErrors);
 app.use(respondNoResourceFound);
 app.use(handleAllErrors);
 

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`)
})
