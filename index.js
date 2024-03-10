const express = require("express");
const connectDB = require('./db/connect');
const mongoose = require('mongoose')
const axios = require('axios');
const jwt = require('jsonwebtoken');
const jwtAuth = require("./middleware/jwtAuth");
const verifySignUp = require('./middleware/verifySignUp')
const bcrypt = require("bcrypt");
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const config = require("./config/auth.config.js");
const fs = require('fs');
const https = require('https');
const verifyUserInfoUpdate = require('./middleware/verifyUserinfoUpdate.js')

// getting the Models to query the DB
const User = require('./models/users')
const items = require('./models/items')
const orders = require('./models/orders');
const verifyLogin = require("./middleware/verifyLogin");
const Blacklist = require("./models/blacklist.js");



const app = express();
app.use(express.json());
app.use(morgan('combined'));
app.use(cors());

// Authenticates new user and hashes password
app.post("/register",
    [verifySignUp.checkDuplicateUserInfo],
    async (req, res) => {
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8)
        });

        res.json({ user })
        const userId = user._id;
    })

// users - collection
app.post('/user', [jwtAuth.verifyToken], async (req, res) => {
    //get user info and compare for login. issue token?
    const user = await User.create(req.body)
    res.json({ user })
})

app.get('/user', [jwtAuth.verifyToken], async (req, res) => {
    const UserID = req.UserID;
    const user = await User.find({ _id: UserID }).exec();
    res.json({ user })
})

app.put('/user', [jwtAuth.verifyToken, verifyUserInfoUpdate.checkDuplicateUserInfo], async (req, res) => {
    const UserID = req.UserID.toString();
    const user = await User.findById(UserID);
    if (req.body.username != null && req.body.username != "") {
        user.username = req.body.username;
    }
    if (req.body.password != null && req.body.password != "") {
        user.password = bcrypt.hashSync(req.body.password, 8)
    }
    if (req.body.email != null && req.body.email != "") {
        user.email = req.body.email;
    }
    user.save()
    res.json({ user })
})

// Login url
app.post("/login", [verifyLogin.verifyCredentials], async (req, res) => {

    const username = req.body.username;

    // Extracting the User's Id based on username at login
    const userObj = await User.find({ username: username });
    const user = userObj[0];
    const userId = user._id;

    const token = jwt.sign({ userId: userId }, config.secret, { expiresIn: "24h" });
    return res.status(200).send({ token, userId });
})

// Logout function
app.get("/logout", async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(400).send({ message: "No authorization token" })
    };
    const accessToken = authHeader.split(' ')[1];
    const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
    if (checkIfBlacklisted) {
        return res.status(401).send({ message: "Unauthorized: Token expired" });
    }
    const newBlacklist = new Blacklist({
        token: accessToken,
    });
    await newBlacklist.save();
    res.status(200).send({ message: 'Successfully logged out' });
});

// connects DB and starts app
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(process.env.PORT, () => console.log("API server is running..."));

    } catch (error) {
        console.log(error);
    }
}

start();