const express = require("express");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const { auth, schemaValidate } = require("../middlewares");
const router = express.Router();
const { userValidate } = require("../validationSchemas");
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require("uuid");
const chance = require('chance').Chance();

require('dotenv').config()

router.post(
  "/register",
  schemaValidate(userValidate.create),
  async (req, res) => {
    try {
      const { username } = req.body;
      const user = await User.findOne({ username });
      if (user) {
        return res.status(409).json({ message: "username in use" });
      }

      
      
      
      const hashedPassword = await bcrypt.hash(req.body.password, 12);
      const newUser = await User.create({
        ...req.body,
        authToken: `m-${chance.integer({ min: 00000, max: 99999 })}`,
        password: hashedPassword,
      });
      
      const config = {
        host: 'smtp.meta.ua',
        port: 465,
        secure: true,
        auth: {
          user: 'd.oliynyk2007@meta.ua',
          pass: process.env.NODE_MAILER_PASS,
        },
      }


      const transporter = nodemailer.createTransport(config)
      const emailOptions = {
        from: 'd.oliynyk2007@meta.ua',
        to: newUser.email,
        subject: 'Nodemailer test',
        text: `TEST ${newUser.authToken}`,
      }
      
      transporter
      .sendMail(emailOptions)
      .catch((err) => console.log(err))
      

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
router.post("/login", schemaValidate(userValidate.login), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await user.validatePassword(req.body.password))) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    if(user.verificated !== true){
      return res.status(400).json({ message: "Please verificate your email" });
    } else {
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
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.get("/me", auth, async (req, res) => {
  try {
    const existingUser = await User.findById(req.user._id)
      .populate("likedPosts")
      .populate("likesComments")
      .populate("readingList");
    if (!existingUser) {
      res.status(409).json({ message: "This user does not exist" });
      return;
    }
    res.status(200).json(existingUser);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get("/email_verification/:id", async (req, res) => {
  const user = await User.findOne({authToken: req.params.id});
  console.log(user)
  if(user){
    user.authToken = null;
    user.verificated = true;
    await user.save();
  }
  
  res.json({'message': 'email verificated ok!'})
})
module.exports = router;
