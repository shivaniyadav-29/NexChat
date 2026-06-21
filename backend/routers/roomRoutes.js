const express = require('express');
const router = express.Router();
const { createRoom, getRooms, joinRoom, leaveRoom, deleteRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRooms);
router.post('/', protect, createRoom);
router.put('/:id/join', protect, joinRoom);
router.put('/:id/leave', protect, leaveRoom);
router.delete('/:id', protect, deleteRoom);

module.exports = router;