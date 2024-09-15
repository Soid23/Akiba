"use strict";

const router = require("express").Router();

const {home,index,indexView, newUser,create,redirectView,
    show,showView,edit,update,deleteUser,authenticate,
    login,logout,assignTokens, 
    verifyJWT} = require("../controllers/userController");

router.get("/home",home );
router.get("/index", index, indexView);
router.get("/register", newUser);
router.post("/register", create, redirectView);
router.post("/login",authenticate,assignTokens);
router.get("/logout", logout, redirectView);
router.get("/:id/edit",edit);
router.put("/:id/update", update, redirectView);
router.get("/:id", show, showView);
router.delete("/:id/delete", deleteUser, redirectView);

module.exports = router;
