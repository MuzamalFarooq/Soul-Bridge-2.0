const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Track connected users (userId -> socket.id)
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join online room / register user ID
    socket.on('register', (userId) => {
      if (userId) {
        socket.userId = userId;
        onlineUsers.set(userId, socket.id);
        
        // Broadcast user's online status
        io.emit('user_status', { userId, status: 'online' });
        console.log(`User ${userId} registered to socket ${socket.id}`);
        
        // Send list of currently online user IDs back to the sender
        socket.emit('online_users_list', Array.from(onlineUsers.keys()));
      }
    });

    // Handle private chat messages
    socket.on('send_message', (messageData) => {
      const { receiverId } = messageData;
      const recipientSocketId = onlineUsers.get(receiverId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('new_message', messageData);
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ conversationId, senderId, receiverId, isTyping }) => {
      const recipientSocketId = onlineUsers.get(receiverId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing_status', { conversationId, senderId, isTyping });
      }
    });

    // Handle read receipts
    socket.on('mark_read', ({ conversationId, senderId, receiverId }) => {
      const recipientSocketId = onlineUsers.get(receiverId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('messages_read', { conversationId, readerId: senderId });
      }
    });

    // WebRTC Signaling Events
    socket.on('call_user', ({ userToCall, signalData, from, name, callType }) => {
      const recipientSocketId = onlineUsers.get(userToCall);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call_incoming', { signal: signalData, from, name, callType });
      }
    });

    socket.on('answer_call', (data) => {
      const recipientSocketId = onlineUsers.get(data.to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call_accepted', data.signal);
      }
    });

    socket.on('decline_call', ({ to }) => {
      const recipientSocketId = onlineUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call_declined');
      }
    });

    socket.on('end_call', ({ to }) => {
      const recipientSocketId = onlineUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call_ended');
      }
    });

    // Live Notification Alerts
    socket.on('send_notification', ({ userId, type, content, link }) => {
      const recipientSocketId = onlineUsers.get(userId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('new_notification', {
          type,
          content,
          link,
          createdAt: new Date()
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('user_status', { userId: socket.userId, status: 'offline' });
      }
    });
  });

  httpServer.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`> Soul Bridge Server ready on http://${hostname}:${port}`);
  });
});
