const Room = require('../models/Room');
const User = require('../models/User');

const createRoom = async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;

    const members = [req.user._id, ...(memberIds || [])];
    const uniqueMembers = [...new Set(members.map(id => id.toString()))];

    const room = await Room.create({
      name,
      description,
      admin: req.user._id,
      members: uniqueMembers
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('admin', 'username avatar')
      .populate('members', 'username avatar');

    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL ROOMS
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate('admin', 'username avatar')
      .populate('members', 'username avatar');

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// JOIN ROOM
const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if already a member
    if (room.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    room.members.push(req.user._id);
    await room.save();

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LEAVE ROOM
const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.members = room.members.filter(
      member => member.toString() !== req.user._id.toString()
    );

    await room.save();
    res.status(200).json({ message: 'Left room successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Message = require('../models/Message');

// DELETE ROOM (Admin only)
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Only admin can delete the group
    if (room.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can delete this group' });
    }

    // Delete all messages in this room
    await Message.deleteMany({ room: room._id });

    // Delete the room itself
    await room.deleteOne();

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRoom, getRooms, joinRoom, leaveRoom, deleteRoom };

