const express = require("express");
const router = express.Router();
const { getUser, postUser, updateUser, deleteUser } = require("../controllers");

router.get("/:userId", getUser);
router.post("/:userId/follow", postUser);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);
router.get("posts/:postId/likes");
router.get("/posts/:postId/comments");
module.exports = router;
