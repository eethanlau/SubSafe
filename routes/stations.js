const express = require("express");
const router = express.Router();
const stations = require("../controllers/stations");
const catchAsync = require("../utils/catchAsync");
const { stationSchema } = require("../schemas.js");
const { isLoggedIn, validateStation, isAuthor } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const Station = require("../models/station");

//Create the post request for when the form is submitted
router.route("/")
  .get(catchAsync(stations.index))
  .post(isLoggedIn, upload.array("image"), validateStation, catchAsync(stations.newStation));

//Create the C functionality in CRUD: (Creating)
router.get("/new", isLoggedIn, stations.renderNewForm);

//Refactor for ID routes as well
router.route("/:id")
  .get(catchAsync(stations.showStation))
  .put(isLoggedIn, isAuthor, upload.array("image"), validateStation, catchAsync(stations.updateStation))
  .delete(isLoggedIn, isAuthor, catchAsync(stations.destroyStation));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(stations.renderEdit));

// Potentially put a get request here for your separate reviews page if necessary
router.get("/:id/review", isLoggedIn, catchAsync(stations.renderReview));

module.exports = router;
