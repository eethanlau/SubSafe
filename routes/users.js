const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const users = require("../controllers/users");
const { reviewSchema } = require("../schemas");

router
  .route("/register")
  .get(users.renderingRegister)
  .post(catchAsync(users.registerUser));

router
  .route("/login")
  .get(users.renderingLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

//Logout of user profile with such function
router.get("/logout", users.logout);

module.exports = router;
