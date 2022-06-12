const express = require("express");
const { tags } = require("../controllers");

const router = express.Router();

router.get("/", tags.getTags);

module.exports = router;
