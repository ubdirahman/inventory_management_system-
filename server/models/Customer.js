const mongoose = require('mongoose'); // Library-ga MongoDB la hadla

// Qaabka macmiilka loo kaydinayo (Customer Schema)
const customerSchema = mongoose.Schema({
    customer_name: { type: String, required: true }, // Magaca macmiilka
    phone: { type: String, required: true }, // Lambarka taleefanka
    address: { type: String }, // Cinwaanka macmiilka
    // Isticmaalaha diwaangeliyey macmiilkan (User reference)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true }); // Qor goorta la abuuray iyo marka la bedelay

module.exports = mongoose.model('Customer', customerSchema);
