const express = require('express');
const router = express.Router();
const { getRoomMessages, getPrivateMessages, sendMessage, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/room/:roomId', protect, getRoomMessages);
router.get('/private/:userId', protect, getPrivateMessages);
router.delete('/:id', protect, deleteMessage);


module.exports = router;