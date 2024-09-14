"use strict";

const router = require("express").Router(),
homeController = require("../controllers/homeController");
const {home} = require("../controllers/homeController");

router.get("/", home);


module.exports = router;