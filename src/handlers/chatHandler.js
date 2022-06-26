const Message = require("../models/Message");
const Chat = require("../models/Chat");
const { User } = require("../models");
module.exports = (io, socket) => {
  const joinChat = (chatId) => {
    socket.join(chatId);
  };
  const leaveChat = (chatId) => {
    socket.leave(chatId);
  };
  const createMessage = async (body, chatId, senderId) => {
    const newMessage = await Message.create({
      body: body,
      chat: chatId,
      sender: senderId,
    });
    const chat = await Chat.findById(chatId);
    chat.messages.addToSet(newMessage.id);
    await chat.save();
    io.to(chatId).emit("message:create", newMessage);
  };
  const createChat = async (receiverId, senderId, cb) => {
    const newChat = await Chat.create({
      users: [receiverId, senderId],
    });
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);
    receiver.chats.addToSet(newChat);
    sender.chats.addToSet(newChat);
    await receiver.save();
    await sender.save();
    io.to([receiverId, senderId]).emit("chat:create", newChat);
    cb(newChat)
  };
  const typing = async (chatId) => {
    io.to(chatId).emit("typing");
  };
  const themeChange = async (chatId, theme) => {
    const chat = await Chat.findById(chatId);
    chat.theme = theme;
    await chat.save();
    io.to(chatId).emit("theme:change", theme);
  };
  socket.on("message:create", createMessage);
  socket.on("chat:create", createChat);
  socket.on("chat:join", joinChat);
  socket.on("typing", typing);
  socket.on("theme:change", themeChange);
  socket.on("chat:leave", leaveChat);
};
