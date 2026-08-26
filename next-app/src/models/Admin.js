const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'subadmin', 'user'], 
        default: 'user' 
    },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    profileImage: { type: String, required: false },
    designation: { type: String, default: 'Content Writer' }
});

// Pre-save hook to hash password before saving to database
adminSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for login
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

