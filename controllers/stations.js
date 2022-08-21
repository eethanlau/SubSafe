const Station = require("../models/station");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
//Pass in mapbox token
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  //Pass in stations from the model Station that consists of all the instances within the model
  const stations = await Station.find({}).populate({
    path: "reviews",
    populate: {
      path: "rating",
    },
  });
  res.render("stations/index", { stations });
};

module.exports.renderNewForm = (req, res) => {
  res.render("stations/new");
};

module.exports.newStation = async (req, res, next) => {
  const geoData = await geocoder.forwardGeocode({
    query: req.body.station.location,
    limit: 1
  }).send()
  const station = new Station(req.body.station);
  station.geometry = geoData.body.features[0].geometry;
  station.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  station.author = req.user._id;
  //Save the product instance to the database and await the saving to the database as it takes time
  await station.save();
  console.log(station);
  req.flash("success", "You have successfully added a new subway station!");
  res.redirect(`/stations/${station._id}`);
};

module.exports.showStation = async (req, res) => {
  //Show the information for specific stations
  //Populate the reviews so we can display them
  const station = await Station.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  //Error flash for the cases in which a station canot be found
  if (!station) {
    req.flash("error", "This subway station cannot be found!");
    return res.redirect("/stations");
  }
  res.render("stations/show", { station });
};

module.exports.renderEdit = async (req, res) => {
  //Show the information for specific stations
  const { id } = req.params;
  const station = await Station.findById(id);
  if (!station) {
    req.flash("error", "This subway station cannot be found!");
    return res.redirect("/stations");
  }
  res.render("stations/edit", { station });
};

module.exports.renderReview = async (req, res) => {
  const station = await Station.findById(req.params.id);
  res.render("stations/review", { station });
};

module.exports.updateStation = async (req, res) => {
  const { id } = req.params;
  const station = await Station.findByIdAndUpdate(id, {
    ...req.body.station
  });
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
  station.images.push(...imgs);
  await station.save();
  if(req.body.deleteImages) {
    for(let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await station.updateOne({$pull: {images: { filename: { $in: req.body.deleteImages }}}});
    console.log(station);
  }
  req.flash(
    "success",
    `You have successfully updated the ${station.title} subway station!`
  );
  res.redirect(`/stations/${station._id}`);
};

module.exports.destroyStation = async (req, res) => {
  const { id } = req.params;
  const station = await Station.findByIdAndDelete(id);
  req.flash(
    "success",
    `You have successfully deleted the ${station.title} subway station!`
  );
  res.redirect("/stations");
};
