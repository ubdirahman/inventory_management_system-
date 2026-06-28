const mongoose = require('mongoose'); // Library-ga MongoDB la hadla

// Qaabka alaabta (Product) loo kaydinayo
const productSchema = mongoose.Schema({
    name: { type: String, required: true }, // Magaca alaabta
    category: { type: String, required: true }, // Nooca ay tahay (Category)
    stock: { type: Number, required: true, default: 0 }, // Tirada bakhaarka ku jirta
    price: { type: Number, required: true }, // Qiimaha hal xabbo
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Maamulaha soo galiyey
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
