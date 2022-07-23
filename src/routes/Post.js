const express = require("express");
const router = express.Router();
const { schemaValidate, auth, verifyEmail } = require("../middlewares");
const { postValidate } = require("../validationSchemas");
const { Post, Tag, User } = require("../models");
const postUsersLikedController = require("../controllers/postLikesController");

const postCommentsController = require("../controllers/postCommentsController");

router.get("/", async (req, res) => {
  try {
    let { search = "", perPage = 10, page = 1, sortBy, sortOrder } = req.query;
    if (page === "") {
      page = 1;
    }

    const posts = await Post.find(
      {
        title: {
          $regex: search,
          $options: "i",
        },
      },
      null,
      {
        limit: Number(perPage),
        skip: (Number(page) - 1) * Number(perPage),
        sort: {
          [sortBy]: Number(sortOrder),
        },
      }
    )
      .populate("author")
      .populate("tags");
    const count = await Post.countDocuments({
      title: {
        $regex: search,
        $options: "i",
      },
    });

    res.json({
      posts,
      count: count,
      activePage: Number(page),
      perPage: Number(perPage),
      pagesCount: Math.ceil(count / Number(perPage)),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get("/recommended", auth, async (req, res) => {
  try {
    let { perPage = 10, page = 1 } = req.query;
    if (page === "") {
      page = 1;
    }

    const posts = await Post.find({ tags: { $in: req.user.likedTags } }, null, {
      limit: Number(perPage),
      skip: (Number(page) - 1) * Number(perPage),
      sort: {
        usersLiked: -1,
      },
    })
      .populate("author")
      .populate("tags");
    const count = await Post.countDocuments({
      tags: { $in: req.user.likedTags },
    });

    res.json({
      posts,
      count: count,
      activePage: Number(page),
      perPage: Number(perPage),
      pagesCount: Math.ceil(count / Number(perPage)),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post(
  "/",
  auth,
  verifyEmail,
  schemaValidate(postValidate.create),
  async (req, res) => {
    try {
      const tagsArr = req.body.tags ? req.body.tags.split(", ") : [];

      const existingTags = await Tag.find({
        name: {
          $in: tagsArr,
        },
      });

      const filtredTags = tagsArr.filter((tagName) => {
        return !existingTags.find((tag) => tag.name === tagName);
      });
      const newTags = await Tag.insertMany(
        filtredTags.map((tagName) => ({
          name: tagName,
        }))
      );

      const newPost = await Post.create({
        title: req.body.title,
        tags: tagsArr ? [...existingTags, ...newTags] : [],
        author: req.user._id,
        thumbnailUrl: req.body.thumbnailUrl,
        usersReading: req.body.usersReading,
        usersLiked: req.body.usersLiked,
        views: req.body.views,
        body: req.body.body,
      });

      req.user.posts.push(newPost._id);
      await req.user.save();

      res.status(201).json(newPost);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

router.get("/:_id", async (req, res) => {
  try {
    const searchedPost = await Post.findById(req.params._id)
      .populate({
        path: "comments",
        populate: {
          path: "author",
        },
      })
      .populate("author")
      .populate("tags");
    res.json(searchedPost);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.put(
  "/:_id",
  auth,
  verifyEmail,
  schemaValidate(postValidate.create),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params._id);
      const tagsArr = req.body.tags ? req.body.tags.split(", ") : [];

      const existingTags = await Tag.find({
        name: {
          $in: tagsArr,
        },
      });

      const filtredTags = tagsArr.filter((tagName) => {
        return !existingTags.find((tag) => tag.name === tagName);
      });
      const newTags = await Tag.insertMany(
        filtredTags.map((tagName) => ({
          name: tagName,
        }))
      );
      if (post.author._id !== req.user._id) {
        res.status(403).json({ message: "Error 403" });
        return;
      }
      const editedPost = await Post.findByIdAndUpdate(
        req.params._id,
        req.body,
        {
          new: true,
        }
      );
      res.json({ editedPost, newTags });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

router.delete("/:_id", auth, verifyEmail, async (req, res) => {
  try {
    const post = await Post.findById(req.params._id);
    if (post.author._id !== req.user._id) {
      res.status(403).json({ message: "Error 403" });
      return;
    }
    await Post.findByIdAndDelete(req.params._id);
    res.json({ message: "Done" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.patch("/:_id/like", auth, verifyEmail, async (req, res) => {
  try {
    const post = await Post.findById(req.params._id);
    if (req.user.likedPosts.includes(req.params._id)) {
      post.usersLiked.pull(post._id);

      req.user = await User.findByIdAndUpdate(
        { _id: req.user._id },
        {
          $pullAll: {
            likedTags: post.tags,
          },
          $pull: { likedPosts: post._id },
        }
      );
    } else {
      post.usersLiked.addToSet(post._id);
      req.user.likedPosts.addToSet(post._id);

      req.user.likedTags.addToSet(...post.tags);
      await req.user.save();
      if (req.user.likedTags.length > 10) {
        for (let i = 0; i <= req.user.likedTags.length - 10; i++) {
          req.user = await User.findByIdAndUpdate(
            req.user._id,
            { $pop: { likedTags: -1 } },
            { new: true }
          );
        }
      }
    }
    await post.save();
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.patch("/:_id/save", auth, verifyEmail, async (req, res) => {
  try {
    const post = await Post.findById(req.params._id);

    if (req.user.readingList.includes(req.params._id)) {
      post.usersReading.pull(post._id);

      req.user.readingList.pull(post._id);
    } else {
      post.usersReading.addToSet(post._id);

      req.user.readingList.addToSet(post._id);
    }
    await post.save();
    await req.user.save();

    res.json({ message: "Done" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.get("/:postId/likes", postUsersLikedController.getPostUsersLiked);
router.get("/:postId/comments", postCommentsController.getPostUsersCommented);

module.exports = router;
