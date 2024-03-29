const express = require('express');
const { User } = require('../models');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const { auth, schemaValidate } = require('../middlewares');
const { upload } = require('../utils');
const router = express.Router();
const { userValidate } = require('../validationSchemas');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const chance = require('chance').Chance();
const fs = require('fs').promises;
require('dotenv').config();

const emailConfig = {
  host: process.env.NODE_MAILER_HOST,
  port: +process.env.NODE_MAILER_PORT,
  secure: true,
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_PASS,
  },
};
const emailTransporter = nodemailer.createTransport(emailConfig);

router.post(
  '/register',
  upload.single('avatar'),
  schemaValidate(userValidate.create),
  async (req, res) => {
    try {
      const avatar = await cloudinary.uploader.upload(req.file.path);
      const { username } = req.body;
      const user = await User.findOne({ username });
      if (user) {
        return res.status(409).json({ message: 'username in use' });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 12);
      const newUser = await User.create({
        ...req.body,
        authToken: `m-${chance.integer({ min: 00000, max: 99999 })}`,
        password: hashedPassword,
        avatarUrl: avatar.url,
      });

      const emailOptions = {
        from: process.env.NODE_MAILER_EMAIL,
        to: newUser.email,
        subject: 'Express Blog Auth Token',
        html: `<h2>Hello</h2> <p>Invitation link: ${newUser.authToken}</p> <p>Hello! This is auth token for your new account in 'express-blog'</p> <p>Have a Good Day!</p>`,
        text: 'Hello, Invitation link: ${newUser.authToken}. Hello! This is auth token for your new account in express-blog. Have a Good Day!',
      };

      const emailResponse = await emailTransporter.sendMail(emailOptions);
      console.log('Response', emailResponse);

      const payload = {
        _id: newUser._id,
      };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET);
      await fs.unlink(req.file.path);
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
router.post('/login', schemaValidate(userValidate.login), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await user.validatePassword(req.body.password))) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const payload = {
      _id: user._id,
    };

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
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
router.get('/me', auth, async (req, res) => {
  try {
    const existingUser = await User.findById(req.user._id)
      .populate('likedPosts')
      .populate('likesComments')
      .populate('readingList');
    if (!existingUser) {
      res.status(409).json({ message: 'This user does not exist' });
      return;
    }
    res.status(200).json(existingUser);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get('/token/verificate/:authToken', async (req, res) => {
  const user = await User.findOne({ authToken: req.params.authToken });
  console.log(user);
  if (user) {
    user.authToken = null;
    user.verificated = true;
    await user.save();
    return res.json({ message: 'email verificated ok!' });
  } else {
    res.status(500).json({
      message: 'something is wrong!',
    });
  }
});

router.post('/token/resend/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user.verificated) {
    const newToken = `m-${chance.integer({ min: 00000, max: 99999 })}`;
    user.authToken = newToken;
    await user.save();

    const emailOptions = {
      from: process.env.NODE_MAILER_EMAIL,
      to: user.email,
      subject: 'Express Blog Auth Token',
      html: `<h2>Hello</h2> <p>Invitation link: ${user.authToken} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sem nisi, feugiat quis libero et, interdum bibendum elit. Pellentesque id ultrices urna. Nulla imperdiet dapibus mattis`,
    };

    emailTransporter.sendMail(emailOptions).catch((err) => console.log(err));

    res.json({
      message: 'token resend OK!',
    });
  } else {
    return res.json({
      message: 'something is wrong!',
    });
  }
});
module.exports = router;
