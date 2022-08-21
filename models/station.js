const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
  url: String,
  filename: String
});

ImageSchema.virtual("thumbnail").get(function() {
  return this.url.replace("/upload", "/upload/w_200")
})
const SubwaySchema = new Schema({
  title: String,
  images: [ImageSchema],
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      //References a review model
      ref: "Review",
    },
  ],
});

SubwaySchema.post("findOneAndDelete", async function (doc) {
  //Remove from the review model reviews that have an ID within the station.reviews that we are deleting
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Station", SubwaySchema);
