const mongoose = require('mongoose'); // Library-ga MongoDB la hadla

const paymentSchema = mongoose.Schema({
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'waafi'], default: 'cash' },
    referenceId: { type: String },
    invoiceId: { type: String },
    payerPhone: { type: String },
    response: { type: mongoose.Schema.Types.Mixed },
    paidAt: { type: Date, default: Date.now }
}, { _id: false });

// Qaabka deynta loo kaydinayo (Debt Schema)
const debtSchema = mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }, // Macmiilka deynta leh
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Alaabta deynta lagu qaatay
    quantity: { type: Number, required: true }, // Tirada alaabta
    price: { type: Number, required: true }, // Qiimaha alaabta
    paidAmount: { type: Number, default: 0 }, // Inta hore loo bixiyey
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' }, // Ma la bixiyey mise waa unpaid?
    paymentMethod: { type: String, enum: ['cash', 'waafi'], default: 'cash' },
    paymentStatus: { type: String, enum: ['paid', 'unpaid', 'partial'], default: 'unpaid' },
    payments: [paymentSchema],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Isticmaalaha qoray deyntan
}, { timestamps: true });

module.exports = mongoose.model('Debt', debtSchema);