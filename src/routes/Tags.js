const express = require("express");
const router = express.Router();
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

    const tags = await Tag.find(
      {
        name: {
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
    );
    const count = await Tag.countDocuments({
      title: {
        $regex: search,
        $options: "i",
      },
    });

    res.json({
      tags,
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

module.exports = router;
