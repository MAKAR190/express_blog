const { Schema, model } = require('mongoose');

const Comment = new Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    // required: true,
  },
  parentPost: {
    type: Schema.Types.ObjectId,
    ref: 'post',
    // required: true,
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'post',
  },
  likes: {
    type: Number,
    default: 0,
  },
},
  {
    timestamps: true,
  }
);

module.exports = model('comment', Comment);