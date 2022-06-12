const { Comment, Post } = require("../models");

exports.getPostUsersCommented = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    const comments = await Comment.find((comment) => {
      comment.parentPost.includes(req.params.postId);
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).send(error);
  }
};
