const mongoose = require('mongoose');

const breakingNewsSchema = new mongoose.Schema({
    text: { type: String, required: true },
    link: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.BreakingNews || mongoose.model('BreakingNews', breakingNewsSchema);

