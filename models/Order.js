// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: String, required: true },
    productos: { type: String, required: true },
    quantity: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    lastName: { type: String, required: true },
    firstName: { type: String, required: true },
    username: { type: String, required: true }
});

module.exports = mongoose.model('Order', orderSchema);
