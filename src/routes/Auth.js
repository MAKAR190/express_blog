const express = require("express");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const { auth, schemaValidate } = require("../middlewares");
const router = express.Router();
const { userValidate } = require("../validationSchemas");
router.post(
  "/register",
  schemaValidate(userValidate.create),
  async (req, res) => {
    try {
      const { username } = req.body;
      const user = await User.findOne({ username });
      if (user) {
        res.status(409).json({ message: "username in use" });
      }
      const newUser = await User.create(req.body);
      const payload = {
        _id: newUser._id,
      };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET);
      res.status(201).json({
        newUser,
        token: jwtToken,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);
router.post("/login", schemaValidate(userValidate.create), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await user.validatePassword(req.body.password))) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }
    const payload = {
      _id: user._id,
    };

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      user: user,
      token: jwtToken,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/me", auth, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = router;
