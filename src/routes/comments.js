const express = require("express");
const { auth, schemaValidate } = require("../middlewares");
const router = express.Router();
const { commentValidate } = require("../validationSchemas");

const { createComment, editComment, likeComment, deleteComment} = require('../controllers/commentsController');

router.post(
  "/",
  schemaValidate(commentValidate.create),
  auth,
  createComment
);

router.put(
  "/:commentId",
  schemaValidate(commentValidate.update),
  auth,
  editComment
);

router.patch(
  "/:commentId/like",
   auth,
  likeComment
);

router.delete(
  "/:commentId",
  auth,
  deleteComment
);

module.exports = router;
