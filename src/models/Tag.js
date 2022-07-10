const { model, Schema } = require("mongoose");

const Tag = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
    },
    popularity: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = model("Tag", Tag);
