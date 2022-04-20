const express = require("express");
const volleyball = require("volleyball");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const cloudinary = require("cloudinary").v2;
const app = express();
const { User } = require("./models");
const {
  UserRoute,
  Auth,
  Postrouter,
  Comments,
  TagRouter,
  GalleryRouter
} = require("./routes");
require("dotenv").config();
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.log(error));
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
passport.use(
  new Strategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload._id);
        if (!user) {
          done(new Error("User not found"));
          return;
        }
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

app.use(express.json());
app.use(volleyball);
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use("/auth", Auth);
app.use("/users", UserRoute);
app.use("/posts", Postrouter);
app.use("/comments", Comments);
app.use("/tags", TagRouter);
app.use("/gallery", GalleryRouter);
app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

module.exports = app;
