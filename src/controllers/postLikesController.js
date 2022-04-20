const { User, Post } = require("../models");

exports.getPostUsersLiked = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    const users = await User.find((user) => {
      user.postsLiked.includes(req.params.postId);
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(error);
  }
};
