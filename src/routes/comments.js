const express = require("express");
const { auth, schemaValidate, verifyEmail } = require("../middlewares");
const router = express.Router();
const { commentValidate } = require("../validationSchemas");
const { createComment, editComment, likeComment, deleteComment} = require('../controllers/commentsController');

router.post(
  "/",
  schemaValidate(commentValidate.create),
  auth,
  verifyEmail,
  createComment
);

router.put(
  "/:commentId",
  schemaValidate(commentValidate.update),
  auth,
  verifyEmail,
  editComment
);

router.patch(
  "/:commentId/like",
  auth,
  verifyEmail,
  likeComment
);

router.delete(
  "/:commentId",
  auth,
  verifyEmail,
  deleteComment
);

module.exports = router;
