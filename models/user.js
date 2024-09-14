"use strict";
const mongoose = require("mongoose"),
  { Schema } = mongoose,
  passportLocalMongoose = require("passport-local-mongoose"),
 userSchema = new Schema(
    {
    
    firstName:{
        type: String,
        required: true
    },
    secondName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
}, 
{
    timestamps: true
  });

userSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
});


module.exports = mongoose.model("User", userSchema);