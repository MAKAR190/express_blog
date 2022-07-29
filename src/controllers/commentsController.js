const { Comment, Post } = require("../models");

async function createComment(req, res) {
  try {
    const newComment = await Comment.create({
      ...req.body,
      author: req.user.id,
    });
    const parentPost = await Post.findById(req.body.parentPost);
    parentPost.comments.push(newComment._id);
    await parentPost.save();
    res.json(newComment);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}

async function editComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment.author.equals(req.user._id)) {
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

async function likeComment(req, res) {
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
}

async function deleteComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment.author.equals(req.user._id)) {
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
}

module.exports = {
  createComment,
  editComment,
  likeComment,
  deleteComment,
};
