const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

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
router.post("/:userId/follow", userController.postUser);
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);
module.exports = router;
