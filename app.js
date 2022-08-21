if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

console.log(process.env.SECRET);
console.log(process.env.API_KEY);

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const Joi = require("joi");

//Destructure your Joi schemas!:
const { stationSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");

const Station = require("./models/station");
const Review = require("./models/review");

//Require our routes
const userRoutes = require("./routes/users");
const stationRoutes = require("./routes/stations");
const reviewRoutes = require("./routes/reviews");
const MongoStore = require("connect-mongo");

// const dburl = process.env.DB_URL;
const dbUrl =  process.env.DB_URL || "mongodb://localhost:27017/SubSafe-T";

mongoose.connect(dbUrl, {});

//Connect the database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Use to parse the request body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
//Set up public directory for future files that we implement
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
);

const secret = process.env.SECRET || "thisshouldbeabettersecret";
//process.env.SECRET ||

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret
  }
});

store.on("error", function(e) {
  console.log("Session Store Error Occurred", e);
})
//Session Configuration for our cookies and session requests
const sessionConfig = {
  store,
  name: "stationSession",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    //Specified Cookie setup for length, duration, etc.
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://fonts.googleapis.com/", 
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://res.cloudinary.com/dkvwgvdil/",
  "https://unsplash.com",
  "https://cdn.jsdelivr.net",
  "https://fonts.google.com/",
  "https://cdnjs.cloudflare.com"
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
  "https://ka-f.fontawesome.com",
];
const fontSrcUrls = ["https://fonts.google.com","https://fonts.googleapis.com/","https://cdnjs.cloudflare.com","https://ka-f.fontawesome.com", "https://fonts.gstatic.com"];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dkvwgvdil/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Flash Middleware to access it as a local variable
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//Prefix your routes
app.use("/", userRoutes);
app.use("/stations", stationRoutes);
app.use("/stations/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

//This is for when a page requested is not found
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

//Error Handler for Error Middleware
app.use((err, req, res, next) => {
  //Create default status error codes and messages and allow for errors thrown to be caught and eventually handled here
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message)
    err.message = "An error occurred! Something has gone wrong.";
  res.status(statusCode).render("error", { err });
});


//Heroku utilizes a different route

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});