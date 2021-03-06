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
      min: 3,
    },
    body: {
      type: String,
      required: true,
      min: 10,
    },
    usersReading: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
    usersLiked: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
    views: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
        required: false,
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: false,
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
