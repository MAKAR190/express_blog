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
    console.log(body, chatId, senderId);
  };
  const createChat = async (receiverId, senderId, cb) => {
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);
    const chat = await Chat.findOne({ users: [receiverId, senderId] })
      .populate("users")
      .populate("messages");
    if (chat) {
      cb(chat);
      return;
    }
    const newChat = await Chat.create({
      users: [receiverId, senderId],
    })
      .populate("users")
      .populate("messages");

    receiver.chats.addToSet(newChat);
    sender.chats.addToSet(newChat);
    await receiver.save();
    await sender.save();
    io.to([receiverId, senderId]).emit("chat:create", newChat);
    cb(newChat);
  };
  const typing = async (chatId) => {
    io.to(chatId).emit("typing");
  };
  const getChats = async (userId, cb) => {
    const user = await User.findById(userId).populate({
      path: "chats",
      populate: [{ path: "users" }, { path: "messages" }],
    });
    io.to(userId).emit("chat:all", user.chats);
    cb(user.chats);
  };
  const getMessages = async (chatId, cb) => {
    const chat = await Chat.findById(chatId).populate({
      path: "messages",
    });
    cb(chat.messages);
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
  socket.on("chat:all", getChats);
  socket.on("messages:all", getMessages);
};
