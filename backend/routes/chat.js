const express = require('express');
const { startChat, getChat, getMyChats, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getMyChats);
router.post('/start', protect, startChat);
router.post('/message', protect, sendMessage);
router.get('/:chatId', protect, getChat);

module.exports = router;
