const { User } = require("../models");
const { auth, schemaValidate } = require("../middlewares");
const { userValidate } = require("../validationSchemas");

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate({
        path: "readingList",
        populate: [
          {
            path: "author",
          },
          {
            path: "tags",
          },
        ],
      })
      .populate("likedPosts")
      .populate("likesComments")
      .populate({
        path: "posts",
        populate: [
          {
            path: "author",
          },
          {
            path: "tags",
          },
        ],
      });
    if (!user) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(error);
  }
};
(exports.postUser = auth),
  async (req, res) => {
    try {
      const following = req.user.following.includes(req.params.userId);
      const followUser = await User.findById(req.params.userId);
      if (following) {
        req.user.following.pull(req.params.userId);
        followUser.followers.pull(req.user._id);
      } else {
        req.user.following.addToSet(req.params.userId);
        followUser.followers.addToSet(req.user._id);
      }
      await req.user.save();
      await followUser.save();
      res.json({
        followUser: followUser,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  };
(exports.updateUser = schemaValidate(userValidate.update)),
  auth,
  async (req, res) => {
    try {
      if (req.user._id !== req.params.userId) {
        res.status(403).json({ message: "Error 403" });
        return;
      }
      const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
        new: true,
      });
      if (!user) {
        res.status(404).json({ message: "Not found" });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).send(error);
    }
  };
(exports.deleteUser = auth),
  async (req, res) => {
    try {
      if (req.user._id !== req.params.userId) {
        res.status(403).json({ message: "Error 403" });
        return;
      }
      const user = await User.findByIdAndDelete(req.params.userId);
      if (!(await user.findById(req.params.userId))) {
        res.status(404).json({ message: "Not found" });
        return;
      }
      res.status(200).json({ message: "User successfully deleted!" });
    } catch (error) {
      res.status(500).send(error);
    }
  };

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate({
        path: "readingList",
        populate: [
          {
            path: "author",
          },
          {
            path: "tags",
          },
        ],
      })
      .populate("likedPosts")
      .populate("likesComments")
      .populate({
        path: "posts",
        populate: [
          {
            path: "author",
          },
          {
            path: "tags",
          },
        ],
      });
    if (!user) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.searchUsers = async (req, res) => {
  try {
    let { search = "", perPage = 10, page = 1, sortBy, sortOrder } = req.query;
    if (page === "") {
      page = 1;
    }
    const users = await User.find(
      {
        $or: [
          {
            lastName: {
              $regex: search,
              $options: "i",
            },
          },
          { firstName: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ],
      },
      null,
      {
        limit: Number(perPage),
        skip: (Number(page) - 1) * Number(perPage),
        sort: {
          [sortBy]: Number(sortOrder),
        },
      }
    );

    const count = await User.countDocuments({
      $or: [
        {
          lastName: {
            $regex: search,
            $options: "i",
          },
        },
        { firstName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    });

    res.json({
      users,
      count: count,
      activePage: Number(page),
      perPage: Number(perPage),
      pagesCount: Math.ceil(count / Number(perPage)),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
