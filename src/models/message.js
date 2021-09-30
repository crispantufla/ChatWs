const mongoose = require('mongoose');
const { Schema } = mongoose;

const message = new Schema({
    author: String,
    content: String,
    created_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('message', message);