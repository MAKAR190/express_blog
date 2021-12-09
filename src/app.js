const express = require("express");
const volleyball = require("volleyball");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const app = express();
const { User } = require("./models");
const { UserRoute, Auth } = require("./routes");
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.log(error));

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

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

module.exports = app;
