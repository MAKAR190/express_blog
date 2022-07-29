const { User } = require("../models");

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

exports.updateUser = async (req, res) => {
  try {
    if (!req.user._id.equals(req.params.userId)) {
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
    console.log(error);
    res.status(500).send(error);
  }
};
exports.deleteUser = async (req, res) => {
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
        ,
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
