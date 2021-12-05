const { model, Schema } = require("mongoose");

const Tag = new Schema(
  {
    name: {
      type: string,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Tag", Tag);
