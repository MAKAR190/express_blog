const express = require("express");
const { User } = require("../models");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const { auth, schemaValidate } = require("../middlewares");
const { upload } = require("../utils");
const router = express.Router();
const { userValidate } = require("../validationSchemas");
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require("uuid");
const chance = require('chance').Chance();

require('dotenv').config()

router.post(
  "/register",
  upload.single("avatar"),
  schemaValidate(userValidate.create),
  async (req, res) => {
    try {
      const avatar = await cloudinary.uploader.upload(req.file.path);
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
        avatarUrl: avatar.url,
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
        subject: 'Lorem ipsum dolor sit amet',
        html: `<h2>Hello</h2> <p>Invitation link: ${newUser.authToken} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sem nisi, feugiat quis libero et, interdum bibendum elit. Pellentesque id ultrices urna. Nulla imperdiet dapibus mattis`,
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

router.get("/token/verificate/:authToken", async (req, res) => {
  const user = await User.findOne({authToken: req.params.authToken});
  console.log(user)
  if(user){
    user.authToken = null;
    user.verificated = true;
    await user.save();
    return res.json({'message': 'email verificated ok!'})
  } else {
    res.json({
      'message': 'something is wrong!'
    })
  }
  
})

router.post("/token/resend/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if(!user.verificated){
    const newToken = `m-${chance.integer({ min: 00000, max: 99999 })}`
    user.authToken = newToken;
    await user.save()
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
      to: user.email,
      subject: 'Lorem ipsum dolor sit amet',
      html: `<h2>Hello</h2> <p>Invitation link: ${user.authToken} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sem nisi, feugiat quis libero et, interdum bibendum elit. Pellentesque id ultrices urna. Nulla imperdiet dapibus mattis`,
    }

    transporter
      .sendMail(emailOptions)
      .catch((err) => console.log(err))

    res.json({
      'message': "token resend OK!"
    })
  } else {
    return res.json({
      'message': 'something is wrong!'
    })
  }
})
module.exports = router;
