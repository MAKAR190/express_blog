const express = require("express");
const { Comment } = require("../models");
const { auth, schemaValidate } = require("../middlewares");
const router = express.Router();
const { commentValidate } = require("../validationSchemas");

router.post(
  "/",
  schemaValidate(commentValidate.create),
  auth,
  async (req, res) => {
    try {
      const newComment = await Comment.create(req.body);
      res.json(newComment);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

router.put(
  "/:commentId",
  schemaValidate(commentValidate.create),
  auth,
  async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.commentId);
      if (comment.author._id !== req.user._id) {
        res.status(403).json({ message: "Error 403" });
        return;
      }
      const updatedComment = await Comment.findByIdAndUpdate(
        req.params.commentId,
        req.body,
        { new: true }
      );
      res.json(updatedComment);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

router.patch("/:commentId/like", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (req.user.likesComments.includes(req.params.commentId)) {
      comment.usersLiked--;

      req.user.likesComments.pull(comment._id);
    } else {
      comment.usersLiked++;

      req.user.likesComments.push(comment._id);
    }
    await comment.save();
    await req.user.save();

    res.json(comment);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.delete("/:commentId", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (comment.author._id !== req.user._id) {
      res.status(403).json({ message: "Error 403" });
      return;
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({
      message: `Comment with id ${req.params.commentId} was deleted`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
