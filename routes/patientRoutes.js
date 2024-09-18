"use strict";

const router = require("express").Router(),
 User = require("../models/user");
const {home,newPatient, registerPatient, index, redirectView,
    showPatient, showView, edit,update, deletePatient,triage,docsReport } = require("../controllers/patientController");
const { verifyJWT } = require("../controllers/userController");


router.get("/home", home);
router.get("/index", index);
router.get("/new", newPatient);
router.post("/registerPatient", registerPatient, redirectView);
router.post("/:id/triagedata", triage);
router.post("/:id/doctorsreport", docsReport);
router.get("/:id/edit", edit);
router.put("/:id/update", update, redirectView);
router.get("/:id", showPatient, showView);
router.delete("/:id/delete", deletePatient, redirectView);

module.exports = router;