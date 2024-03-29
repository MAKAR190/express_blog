const express = require("express");
const volleyball = require("volleyball");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const cloudinary = require("cloudinary").v2;
const { User } = require("./models");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/main.json");
const authDocs = require("./docs/auth-docs.json");
const commentsDocs = require("./docs/comments-docs.json");
const galleryDocs = require("./docs/gallery-docs.json");
const tagsDocs = require("./docs/tags-docs.json");
const postsDocs = require("./docs/posts-docs.json");
const userDocs = require("./docs/user-docs.json");
const { Server } = require("socket.io");
const {
  UserRoute,
  Auth,
  Postrouter,
  Comments,
  TagRouter,
  GalleryRouter,
} = require("./routes");
const chatHandler = require("./handlers/chatHandler");
require("dotenv").config();
const app = express();
const http = require("http").createServer(app);
const io = new Server(http, {
  cors: {
    origin: "*",
  },
});
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.log(error));
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const onConnection = (socket) => {
  chatHandler(io, socket);
};

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
swaggerDocument.paths = {
  ...authDocs,
  ...commentsDocs,
  ...galleryDocs,
  ...tagsDocs,
  ...postsDocs,
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(volleyball);
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use("/auth", Auth);
app.use("/users", UserRoute);
app.use("/posts", Postrouter);
app.use("/comments", Comments);
app.use("/tags", TagRouter);
app.use("/gallery", GalleryRouter);
app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});
io.on("connection", onConnection);

module.exports = http;
