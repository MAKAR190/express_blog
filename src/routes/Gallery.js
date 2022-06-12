const express = require("express");
const { upload } = require("../utils");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const image = await cloudinary.uploader.upload(req.file.path);
    await fs.unlink(`${req.file.destination}/${req.file.originalname}`);
    res.status(200).json(image)
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
