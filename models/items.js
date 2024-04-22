const mongoose = require('mongoose')

const ItemsSchema = new mongoose.Schema({
    item_name: String,
    price: Number,
    image: String,
    sale: Boolean,
    category: String,
    item_url: String
})

module.exports = mongoose.model('Items', ItemsSchema)