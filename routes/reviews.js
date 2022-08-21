const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const Station = require("../models/station");
const Review = require("../models/review");
const reviews = require("../controllers/reviews");

const { reviewSchema } = require("../schemas.js");

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

//Allow for the creation of reviews by users
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.destroyReview)
);

module.exports = router;
