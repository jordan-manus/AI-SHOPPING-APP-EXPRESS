const mongoose = require("mongoose");
const BlacklistSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            ref: "Users",
        },
        createdAt: { type: Date, expires: 86400 }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Blacklist", BlacklistSchema);