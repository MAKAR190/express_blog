const { User, Post } = require("../models");

exports.getPostUsersLiked = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate("usersLiked");
    if (!post) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    const users = post;
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(error);
  }
};
