const { model, Schema } = require("mongoose");
const bcrypt = require("bcryptjs");
const User = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: false,
    },
    avatarUrl: {
      type: String,
      required: true,
    },
    githubUrl: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    work: {
      type: String,
      required: false,
    },
    hobby: {
      type: String,
      required: false,
    },
    birthDate: {
      type: Date,
      required: false,
    },

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    readingList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
      },
    ],
    likedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
      },
    ],
    likesComments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: true,
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);
User.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12);
});
User.methods.validatePassword = async function (password) {
  return await bcrypt.compare(this.password, password);
};
module.exports = model("User", User);
