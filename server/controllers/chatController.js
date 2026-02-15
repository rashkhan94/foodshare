const Chat = require('../models/Chat');
const Notification = require('../models/Notification');

exports.getMyChats = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user._id })
            .populate('participants', 'name avatar online')
            .populate('listing', 'title images')
            .sort({ updatedAt: -1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getChatMessages = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id)
            .populate('participants', 'name avatar online')
            .populate('listing', 'title images')
            .populate('messages.sender', 'name avatar');

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        const isParticipant = chat.participants.some(p => p._id.toString() === req.user._id.toString());
        if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

        // Mark messages as read
        chat.messages.forEach(msg => {
            if (msg.sender._id.toString() !== req.user._id.toString()) {
                msg.read = true;
            }
        });
        await chat.save();

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.startChat = async (req, res) => {
    try {
        const { userId, listingId, message } = req.body;

        // Check if chat already exists
        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, userId] },
            listing: listingId
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [req.user._id, userId],
                listing: listingId,
                messages: [{
                    sender: req.user._id,
                    text: message
                }],
                lastMessage: message
            });
        } else {
            chat.messages.push({ sender: req.user._id, text: message });
            chat.lastMessage = message;
            await chat.save();
        }

        const populated = await Chat.findById(chat._id)
            .populate('participants', 'name avatar online')
            .populate('listing', 'title images')
            .populate('messages.sender', 'name avatar');

        // Notify the other user
        const notification = await Notification.create({
            user: userId,
            type: 'chat',
            title: 'New Message',
            message: `${req.user.name}: ${message.substring(0, 50)}...`,
            link: `/chat/${chat._id}`,
            relatedId: chat._id
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`user_${userId}`).emit('notification', notification);
            io.to(`chat_${chat._id}`).emit('chat-message', {
                chatId: chat._id,
                message: populated.messages[populated.messages.length - 1]
            });
        }

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
