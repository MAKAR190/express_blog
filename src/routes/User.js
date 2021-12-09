const express = require("express");
const { User } = require("../model");
const router = express.Router();
const { auth } = require("../middlewares");
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/:userId/follow", async (req, res) => {
  try {
  } catch (error) {
    res.status(500).send(error);
  }
});
router.put("/:userId", auth, async (req, res) => {
  try {
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
});
router.delete("/:userId", auth, async (req, res) => {
  try {
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

module.exports = router;
