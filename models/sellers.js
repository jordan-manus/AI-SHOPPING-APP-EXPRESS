const mongoose = require('mongoose')

const SellersSchema = new mongoose.Schema({
    seller_name: String,
    address: String,
    phone_number: String,
    email: String,
    itemsID: Array,
    UserID: String, //FK
})

module.exports = mongoose.model('Sellers', SellersSchema)