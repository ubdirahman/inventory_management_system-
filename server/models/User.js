const mongoose = require('mongoose'); // Library-ga MongoDB la hadla

// Qeexidda qaabka isticmaalaha loo kaydinayo (User Schema)
const userSchema = mongoose.Schema({
    full_name: { type: String, required: true }, // Magaca oo buuxa
    phone: { type: String, required: true }, // Lambarka taleefanka
    username: { type: String, required: true, unique: true }, // Magaca login-ka (waa inuu gaar noqdaa)
    password: { type: String, required: true }, // Password-ka (la qariyey)
    role: { type: String, enum: ['admin', 'user'], default: 'user' }, // Doorka (Maamul ama Isticmaale)
    isBlocked: { type: Boolean, default: false } // Haddii laga xiray nidaamka
}, { timestamps: true }); // Waxay si otomaatig ah u qoraysaa goorta la abuuray (createdAt)

module.exports = mongoose.model('User', userSchema); // U gudbi qaybaha kale ee server-ka
