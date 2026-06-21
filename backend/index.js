const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('NexChat server is running! 🚀');
});

// Routes
const authRoutes = require('./routers/authRoutes');
app.use('/api/auth', authRoutes);
const roomRoutes = require('./routers/roomRoutes');
const messageRoutes = require('./routers/messageRoutes');
const uploadRoutes = require('./routers/uploadRoutes');

app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch((err) => console.log('MongoDB error:', err));

// Socket.io
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their userId
  socket.on('userOnline', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  // Join a room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Send message to room
  socket.on('sendMessage', (message) => {
    io.to(message.room).emit('receiveMessage', message);
  });

  // Send private message
  socket.on('sendPrivateMessage', (message) => {
    const receiverSocket = onlineUsers.get(message.receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit('receivePrivateMessage', message);
    }
  });

  // Typing indicator
  socket.on('typing', ({ roomId, username }) => {
    socket.to(roomId).emit('userTyping', username);
  });

  socket.on('stopTyping', (roomId) => {
    socket.to(roomId).emit('userStopTyping');
  });

  // Disconnect
  socket.on('disconnect', () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});