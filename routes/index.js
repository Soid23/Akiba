"use strict";
const router = require("express").Router(),
homeRoutes = require("./homeRoutes"),
userRoutes = require("./userRoutes"),
patientRoutes = require("./patientRoutes");

router.use("/users", userRoutes);
router.use("/", homeRoutes);
router.use("/patients", patientRoutes);
module.exports = router; 