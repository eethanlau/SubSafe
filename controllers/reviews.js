const Station = require("../models/station");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const station = await Station.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  station.reviews.push(review);
  await review.save();
  await station.save();
  req.flash(
    "success",
    `You have successfully created a new review for ${station.title}!`
  );
  res.redirect(`/stations/${station._id}`);
};

module.exports.destroyReview = async (req, res) => {
  //Destructuring the id and the reviewId will leave us with values we can utilize in order to delete the review from our collection
  const { id, reviewId } = req.params;
  //Find station by station ID for displaying flash message later on
  const station = await Station.findById(id);
  //Pull function in mongo pulls that instance out of the database as it is two-way relationship and we need to update on both ends
  await Station.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  //Delete the review from the review model within the database
  await Review.findByIdAndDelete(reviewId);
  req.flash(
    "success",
    `You have successfully deleted a review for ${station.title}!`
  );
  res.redirect(`/stations/${id}`);
};
