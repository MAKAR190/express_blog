const express = require("express");
const router = express.Router();
const { getUser, postUser, updateUser, deleteUser } = require("../controllers");

router.get("/:userId", getUser);
router.post("/:userId/follow", postUser);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);
module.exports = router;
