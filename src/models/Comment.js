const { Schema, model } = require('mongoose');

const Comment = new Schema(
  {
    text: {
      type: String,
      required: true,
      min: 2,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    parentPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: false,
    },
    likes: {
      type: Number,
      required: true,
      default:0 
    },
  },
  {
    timestamps: true,
  }
);


module.exports = model('Comment', Comment);
