const express = require("express");
const userController = require("../controllers/userController");

const { auth, schemaValidate, verifyEmail } = require("../middlewares");
const { userValidate } = require("../validationSchemas");
const { User, Post, Tag, Notification } = require("../models");

const router = express.Router();

router.get("/notifications", auth, async (req, res) => {
  console.log(req.user._id);
  const user = await User.findById(req.user._id).populate({
    path: "notifications",
    populate: [
      {
        path: "entity",
      },
      {
        path: "user",
      },
    ],
  });

  return res.json(user.notifications);
});

router.post("/:userId/follow", auth, verifyEmail, async (req, res) => {
  try {
    const following = req.user.following.includes(req.params.userId);
    const followUser = await User.findById(req.params.userId);

    if (following) {
      req.user.following.pull(req.params.userId);
      followUser.followers.pull(req.user._id);
    } else {
      const new_notify = await Notification.create({
        user: req.user._id,
        entity: followUser._id,
        type: "User",
        action: "FOLLOW",
      });

      await User.findByIdAndUpdate(followUser._id, {
        $push: {
          notifications: new_notify._id,
        },
      });
      req.user.following.addToSet(req.params.userId);
      followUser.followers.addToSet(req.user._id);
    }
    await req.user.save();
    await followUser.save();
    res.json({
      followUser: followUser,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/:userId", auth, verifyEmail, async (req, res) => {
  try {
    if (req.user._id !== req.params.userId) {
      res.status(403).json({ message: "Error 403" });
      return;
    }
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!(await user.findById(req.params.userId))) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.status(200).json({ message: "User successfully deleted!" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:userId/followers", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    res.json({ followers: user.followers });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get("/:userId/following", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    res.json({ followers: user.following });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get("/", userController.searchUsers);
router.get("/:userId", userController.getUser);
router.put(
  "/:userId",
  schemaValidate(userValidate.update),
  auth,
  verifyEmail,
  userController.updateUser,
)
module.exports = router;
