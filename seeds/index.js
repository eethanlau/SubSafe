//File that will eventually allow you to seed your stations
require('dotenv').config();
const mongoose = require("mongoose");
//The dot refers to our current directory
const cities = require("./cities");
//Destructure the parameters here and utilize specifically what you want to see your database
//subwaystations is now a destructured array that you may utilize
const { subwaystations } = require("./subwaystations");

const Station = require("../models/station");
const review = require("../models/review");

// "mongodb://localhost:27017/SubSafe-T"
mongoose.connect(process.env.DB_URL, {});

//Connect the database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

//Test function for subway stations
const seedDB = async () => {
  await Station.deleteMany({});
  for (let i = 0; i < subwaystations.length; i++) {
    const station = new Station({
      author: "62fefe40b28b4a5f84f8d3ad",
      //Your title will be obtained from running the sample function on these two module exported arrays from seedHelpers.js
      title: `${subwaystations[i][10]}`,
      location: `(${subwaystations[i][11].slice(7, subwaystations[i][11].indexOf(" ", 6))} , ${subwaystations[i][11].slice(subwaystations[i][11].indexOf(" ", 6) + 1, subwaystations[i][11].indexOf(")"))})`,
      images: [
        {
          url: 'https://res.cloudinary.com/dkvwgvdil/image/upload/v1660500761/SubSafe/jh0shmnbqhzn3pa1m4kc.jpg',
          filename: 'SubSafe/jh0shmnbqhzn3pa1m4kc',
        }
      ],
      geometry: {
        type: "Point",
        coordinates: [Number(subwaystations[i][11].slice(7, subwaystations[i][11].indexOf(" ", 6))), Number(subwaystations[i][11].slice(subwaystations[i][11].indexOf(" ", 6) + 1, subwaystations[i][11].indexOf(")")))],
      },
      description: `${subwaystations[i][12]}`,
      price: 2.75,
    });
    await station.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
