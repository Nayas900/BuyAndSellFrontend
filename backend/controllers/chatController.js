const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Product = require('../models/Product');

// POST /chat/start  — start or resume a chat for a product
const startChat = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Buyer cannot chat with themselves
    if (product.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot chat with yourself' });
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({ productId, buyerId: req.user._id });

    if (!chat) {
      chat = await Chat.create({
        productId,
        buyerId: req.user._id,
        sellerId: product.sellerId,
      });
    }

    await chat.populate([
      { path: 'productId', select: 'title price images location' },
      { path: 'buyerId', select: 'name avatar' },
      { path: 'sellerId', select: 'name avatar' },
    ]);

    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
};

// GET /chat/:chatId  — fetch chat + messages
const getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate([
      { path: 'productId', select: 'title price images location' },
      { path: 'buyerId', select: 'name avatar' },
      { path: 'sellerId', select: 'name avatar' },
    ]);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Only participants can view the chat
    const isParticipant =
      chat.buyerId._id.toString() === req.user._id.toString() ||
      chat.sellerId._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ chatId: chat._id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name avatar');

    // Mark unread messages as read for the current user
    await Message.updateMany(
      { chatId: chat._id, senderId: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );

    res.json({ chat, messages });
  } catch (err) {
    next(err);
  }
};

// GET /chat  — list all chats for current user
const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }],
    })
      .sort({ lastMessageAt: -1 })
      .populate([
        { path: 'productId', select: 'title price images' },
        { path: 'buyerId', select: 'name avatar' },
        { path: 'sellerId', select: 'name avatar' },
      ]);

    // Attach unread count per chat
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          senderId: { $ne: req.user._id },
          isRead: false,
        });
        return { ...chat.toObject(), unreadCount };
      })
    );

    res.json(chatsWithUnread);
  } catch (err) {
    next(err);
  }
};

// POST /chat/message  — send a message
const sendMessage = [
  body('chatId').notEmpty().withMessage('chatId is required'),
  body('text').trim().notEmpty().withMessage('Message text is required'),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { chatId, text } = req.body;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      // Only participants can send messages
      const isParticipant =
        chat.buyerId.toString() === req.user._id.toString() ||
        chat.sellerId.toString() === req.user._id.toString();

      if (!isParticipant) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const message = await Message.create({
        chatId,
        senderId: req.user._id,
        text,
      });

      // Update chat's lastMessage snapshot
      chat.lastMessage = text.length > 60 ? text.slice(0, 60) + '...' : text;
      chat.lastMessageAt = new Date();
      await chat.save();

      await message.populate('senderId', 'name avatar');

      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  },
];

module.exports = { startChat, getChat, getMyChats, sendMessage };
