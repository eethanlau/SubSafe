const { stationSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Station = require("./models/station");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  //Allows us to authenticate if a user is signed in first in order to actually add a subway station
  //Implemented middleware
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash(
      "error",
      "Please sign in or register an account with us in order to add new subway stations."
    );
    return res.redirect("/login");
  }
  next();
};

//Put the error handling function into its own variable to be called upon when necessary and for efficiency
module.exports.validateStation = (req, res, next) => {
  const { error } = stationSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((e) => e.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const station = await Station.findById(id);
  if (!station.author.equals(req.user._id)) {
    req.flash(
      "error",
      "Permission has not been granted for you to complete this action."
    );
    return res.redirect(`/stations/${id}`);
  }
  next();
};

//Validates reviews on the server-side of things and refers to the error handling function if an error exists
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((e) => e.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash(
      "error",
      "Permission has not been granted for you to complete this action."
    );
    return res.redirect(`/stations/${id}`);
  }
  next();
};
