"use strict";
const router = require("express").Router(),
homeRoutes = require("./homeRoutes"),
userRoutes = require("./userRoutes");

router.use("/users", userRoutes);
router.use("/", homeRoutes);
module.exports = router; 