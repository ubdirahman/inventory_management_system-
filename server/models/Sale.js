const mongoose = require('mongoose'); // Library-ga MongoDB la hadla

// Qaabka iibka (Sale) loo kaydinayo
const saleSchema = mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Alaabta la iibiyey
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, // Macmiilka lacagta laga qaaday haddii WaafiPay la isticmaalay
    quantity: { type: Number, required: true }, // Tirada la iibiyey
    price: { type: Number, required: true }, // Qiimaha lagu iibiyey
    total: { type: Number, required: true }, // Wadarta guud (Quantity * Price)
    paymentMethod: { type: String, enum: ['cash', 'waafi'], default: 'cash' },
    paymentStatus: { type: String, enum: ['paid', 'unpaid', 'failed'], default: 'paid' },
    paymentReference: { type: String },
    paymentInvoice: { type: String },
    payerPhone: { type: String },
    paymentResponse: { type: mongoose.Schema.Types.Mixed },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Isticmaalaha iibka sameeyey
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);