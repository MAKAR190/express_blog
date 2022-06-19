const { Schema, model } = require("mongoose");

const Notification = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    entity: {
      type: Schema.Types.ObjectId,
      refPath: "type",
    },
    type: {
      type: String,
      enum: ["Post", "Comment", "User", "message"],
      required: true,
    },
    action: {
      type: String,
      enum: ["LIKE", "FOLLOW", "CREATE", "REPLY"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Notification", Notification);
