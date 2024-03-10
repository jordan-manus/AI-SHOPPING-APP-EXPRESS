const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
    {
        token: {
            wishlist_name: String,
            userID: String,
            itemID: Array,
        },
    },
);

module.exports = mongoose.model("wishlist", WishlistSchema);