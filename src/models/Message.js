const { Schema, model } = require("mongoose");

const Message = new Schema(
  {
    body: {
      type: String,
      required: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "chat",
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Message", Message);
