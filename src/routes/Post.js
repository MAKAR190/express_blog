const express = require("express");

const { schemaValidate, auth, verifyEmail } = require("../middlewares");
const { postValidate } = require("../validationSchemas");
const { User, Post, Tag, Notification } = require("../models");

const postUsersLikedController = require("../controllers/postLikesController");

const postCommentsController = require("../controllers/postCommentsController");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let {
      search = "",
      perPage = 10,
      page = 1,
      sortBy = "usersLiked",
      sortOrder = -1,
      tagsInclude = "",
      tagsExclude = "",
    } = req.query;
    if (page === "") {
      page = 1;
    }

    const tagsIncludeArr = tagsInclude === '' ? [] : tagsInclude.split(", ");

    const tagsExcludeArr = tagsExclude === '' ? [] : tagsExclude.split(", ");

    console.log(tagsIncludeArr);

    const filter = {
      tags: {
        $nin: tagsExcludeArr,
      },
      title: {
        $regex: search,
        $options: "i",
      },
    }

    if (tagsIncludeArr.length > 0) {
      filter.tags.$all = tagsIncludeArr;
    }

    const posts = await Post.find(
      filter,
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
    const count = await Post.countDocuments(filter);

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

    const filter = {
      tags: { $in: req.user.likedTags },
      usersLiked: { $ne: req.user._id }
    };
    const posts = await Post.find(filter,
    null,
    {
      limit: Number(perPage),
      skip: (Number(page) - 1) * Number(perPage),
      sort: {
        usersLiked: -1,
      },
    })
      .populate("author")
      .populate("tags");
    const count = await Post.countDocuments(filter);

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

      const new_notify = await Notification.create({
        user: req.user._id,
        entity: newPost._id,
        type: "Post",
        action: "CREATE",
      });

      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          notifications: new_notify._id,
        },
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
    const searchedPost = await Post.findByIdAndUpdate(req.params._id, {
      $inc: {
        views: 1,
      }
    }, { new: true })
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

      if (!post.author._id.equals(req.user._id)) {
        res.status(403).json({ message: "Error 403" });
        return;
      }

      const editedPost = await Post.findByIdAndUpdate(
        req.params._id,
        {
          ...req.body,
          tags: tagsArr ? [...existingTags, ...newTags] : [],
        },
        {
          new: true,
        }
      );
      res.json(editedPost);
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
    const user_sender = req.user._id;

    if (req.user.likedPosts.includes(req.params._id)) {
      post.usersLiked.pull(user_sender);
      req.user.likedPosts.pull(post._id);
      await post.save();
      await req.user.save();
    } else {
      post.usersLiked.addToSet(user_sender);
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
      const new_notify = await Notification.create({
        user: user_sender,
        entity: req.params._id,
        type: "Post",
        action: "LIKE",
      });

      await User.findByIdAndUpdate(post.author, {
        $push: {
          notifications: new_notify._id,
        },
      });
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
