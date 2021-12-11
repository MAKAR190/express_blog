const { model, Schema } = require("mongoose");

const Post = new Schema(
  {
    thumbnailUrl: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    usersReading: {
      type: Number,
      required: true,
    },
    usersLiked: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      required: true,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "tag",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: true,
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Post", Post);
