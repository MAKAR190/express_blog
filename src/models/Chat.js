const { Schema, model } = require("mongoose");

const Chat = new Schema(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    theme: {
      type: String,
      default: "default",
      required: true,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "message",
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
Chat.virtual("lastMessage").get(function () {
  return this.messages[this.messages.length - 1];
});
module.exports = model("chat", Chat);
