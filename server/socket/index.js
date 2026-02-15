const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const User = require('../models/User');

module.exports = (io) => {
    // Auth middleware for socket
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) return next(new Error('User not found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

        // Join personal room for notifications
        socket.join(`user_${socket.user._id}`);

        // Set user online
        await User.findByIdAndUpdate(socket.user._id, { online: true });
        io.emit('user-online', { userId: socket.user._id, online: true });

        // Join chat rooms
        socket.on('join-chat', (chatId) => {
            socket.join(`chat_${chatId}`);
        });

        socket.on('leave-chat', (chatId) => {
            socket.leave(`chat_${chatId}`);
        });

        // Handle chat messages
        socket.on('send-message', async (data) => {
            try {
                const { chatId, text } = data;
                const chat = await Chat.findById(chatId);
                if (!chat) return;

                const isParticipant = chat.participants.some(p => p.toString() === socket.user._id.toString());
                if (!isParticipant) return;

                chat.messages.push({
                    sender: socket.user._id,
                    text,
                    read: false
                });
                chat.lastMessage = text;
                await chat.save();

                const message = chat.messages[chat.messages.length - 1];

                io.to(`chat_${chatId}`).emit('chat-message', {
                    chatId,
                    message: {
                        _id: message._id,
                        sender: {
                            _id: socket.user._id,
                            name: socket.user.name,
                            avatar: socket.user.avatar
                        },
                        text,
                        read: false,
                        createdAt: message.createdAt
                    }
                });

                // Notify other participant
                const otherUser = chat.participants.find(p => p.toString() !== socket.user._id.toString());
                io.to(`user_${otherUser}`).emit('chat-notification', {
                    chatId,
                    senderName: socket.user.name,
                    text: text.substring(0, 50)
                });
            } catch (error) {
                console.error('Socket message error:', error);
            }
        });

        // Typing indicator
        socket.on('typing', (data) => {
            socket.to(`chat_${data.chatId}`).emit('typing', {
                chatId: data.chatId,
                userId: socket.user._id,
                name: socket.user.name
            });
        });

        socket.on('stop-typing', (data) => {
            socket.to(`chat_${data.chatId}`).emit('stop-typing', {
                chatId: data.chatId,
                userId: socket.user._id
            });
        });

        // Disconnect
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.name}`);
            await User.findByIdAndUpdate(socket.user._id, { online: false });
            io.emit('user-online', { userId: socket.user._id, online: false });
        });
    });
};
