const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    linkName: String,
    url: String,
    gaViewId: String, // Google Analytics View ID
});

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    links: [linkSchema],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
