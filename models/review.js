//Review Model
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Have diferent amount of stars for differet ratings and have an average score between them all... perhaps?
const reviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Review", reviewSchema);
