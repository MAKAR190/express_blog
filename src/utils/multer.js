const multer = require("multer");
const path = require("path");
const uploadDir = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
});
module.exports = upload;