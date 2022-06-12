const express = require("express");
const router = express.Router();
const { schemaValidate, auth } = require("../middlewares");
const { Post } = require("../models");
const { Tag } = require("../models");

router.get("/", async (req, res) => {
  try {
    let {
      search = "",
      perPage = 10,
      page = 1,
      sortBy,
      sortOrder,
      tagsInclude,
      tagsExclude,
    } = req.query;
    if (page === "") {
      page = 1;
    }

    const posts = await Post.find(
      {
        title: {
          $regex: search,
          $options: "i",
        },
        tags: {
          $regex: tagsInclude,
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
    );
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

router.post("/", auth, async (req, res) => {
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
      // author: req.user._id,
      thumbnailUrl: req.body.thumbnailUrl,
      usersReading: req.body.usersReading,
      usersLiked: req.body.usersLiked,
      views: req.body.views,
      body: req.body.body,
    });

    res.json({ newTags, newPost });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get("/:_id", async (req, res) => {
  try {
    const searchedPost = await Post.findById(req.params._id);
    res.json(searchedPost);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.put("/:_id", async (req, res) => {
  try {
    const editedPost = await Post.findByIdAndUpdate(req.params._id, req.body, {
      new: true,
    });
    res.json(editedPost);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.delete("/:_id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params._id);
    res.json({ message: "Done" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.patch("/:_id/likes", async (req, res) => {
  try {
    await Post.findOneAndUpdate(req.params._id.usersLiked, req.body, {
      new: true,
    });
    res.json({ message: "Done" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.patch("/:_id/save", async (req, res) => {
  try {
    await Post.findOneAndUpdate(req.params._id.usersReading, req.body, {
      new: true,
    });
    res.json({ message: "Done" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
