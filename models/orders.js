const mongoose = require('mongoose')

const OrdersSchema = new mongoose.Schema({
    order_date: Date,
    cost: Number,
    itemsID: Array,
    UserID: String, //FK
})

module.exports = mongoose.model('Orders', OrdersSchema)