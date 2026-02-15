const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    read: { type: Boolean, default: false }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [messageSchema],
    lastMessage: { type: String, default: '' },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing' }
}, { timestamps: true });

chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);
