const mongoose = require('mongoose')

const ItemsSchema = new mongoose.Schema({
    item_name: String,
    price: Number,
    sale: Boolean,

})

module.exports = mongoose.model('Items', ItemsSchema)