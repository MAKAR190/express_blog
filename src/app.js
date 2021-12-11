const express = require("express");
const volleyball = require("volleyball");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Postrouter = require("./routes/Post");
const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.log(error));

app.use(express.json());
app.use(volleyball);
app.use(helmet());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});
app.use("/api/posts", Postrouter);
module.exports = app;
