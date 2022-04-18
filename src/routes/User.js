const express = require("express");
const router = express.Router();
const { getUser, postUser, updateUser, deleteUser } = require("../controllers");

router.get("/:userId", getUser);
router.get("/:userId/follow", postUser);
router.get("/:userId", updateUser);
router.get("/:userId", deleteUser);
module.exports = router;
