const { model, Schema } = require("mongoose");
const bcrypt = require("bcryptjs");
const User = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 2,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    firstName: {
      type: String,
      required: true,
      min: 2,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
    },
    location: {
      type: String,
      required: false,
    },
    avatarUrl: {
      type: String,
      required: false,
      default:
        "https://i0.wp.com/spzomega.com.ua/wp-content/uploads/2016/08/default-placeholder.png?resize=300%2C300",
    },
    githubUrl: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
      min: 3,
    },
    work: {
      type: String,
      required: false,
      min: 3,
    },
    hobby: {
      type: String,
      required: false,
      min: 3,
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
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

User.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

User.methods.validatePassword = async function (password) {
  return await bcrypt.compare(this.password, password);
};
module.exports = model("User", User);
