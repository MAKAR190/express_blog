const express = require("express");
const { User } = require("../models");
const router = express.Router();
const { auth, schemaValidate } = require("../middlewares");
const { userValidate } = require("../validationSchemas");
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate({
        path: "readingList",
        populate: [
          {
            path: "author",
          },
          {
            path: "tags",
          },
        ],
      })
      .populate("likedPosts")
      .populate("likesComments")
      .populate({
        path: "posts",
        populate: [
          {
            path: "author",
          },
          {
            path: "tags",
          },
        ],
      });
    if (!user) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/:userId/follow", auth, async (req, res) => {
  try {
    const following = req.user.following.includes(req.params.userId);
    const followUser = await User.findById(req.params.userId);
    if (following) {
      req.user.following.pull(req.params.userId);
      followUser.followers.pull(req.user._id);
    } else {
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
router.put(
  "/:userId",
  schemaValidate(userValidate.update),
  auth,
  async (req, res) => {
    try {
      if (req.user._id !== req.params.userId) {
        res.status(403).json({ message: "Error 403" });
        return;
      }
      const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
        new: true,
      });
      if (!user) {
        res.status(404).json({ message: "Not found" });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
router.delete("/:userId", auth, async (req, res) => {
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

module.exports = router;
