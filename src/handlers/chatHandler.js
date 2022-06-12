const Message = require("../models/Message");
const Chat = require("../models/Chat");
const { User } = require("../models");
module.exports = (io, socket) => {
  const createMessage = async (body, chatId, senderId) => {
    const newMessage = await Message.create({
      body: body,
      chat: chatId,
      sender: senderId,
    });
    io.to(chatId).emit("message created", newMessage);
  };
  const createChat = async (receiverId, senderId) => {
    const newChat = await Chat.create({
      users: [receiverId, senderId],
    });
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);
    receiver.chats.addToSet(newChat);
    sender.chats.addToSet(newChat);
    await receiver.save();
    await sender.save();
  };
  socket.on("message:create", createMessage);
  socket.on("chat:create", createChat);
};
