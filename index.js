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
const items = require("./models/items");
const { error } = require("console");



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


// questionnaire endpoints
app.post('/questionnaire', [jwtAuth.verifyToken], async (req, res) => {
    const UserID = req.UserID
    Object.assign(req.body, { UserID })
    const questionnaire = await questionnaire.create(req.body)
    res.json({ questionnaire })
})

app.get('/questionnaire', [jwtAuth.verifyToken], async (req, res) => {
    const UserID = req.UserID;
    Object.assign(req.body, { UserID });
    try {
        const questionnaire = await questionnaire.findOne({ UserID: UserID });
        res.json(questionnaire)
    } catch {
        res.status(500).json(Error)
    }
})

app.put('/questionnaire', [jwtAuth.verifyToken], async (req, res) => {
    const UserID = req.UserID;
    const questionnaireArray = await questionnaire.find({ UserID: UserID });
    //Removes userPref from the array it was returned in
    const questionnaire = questionnaireArray[0]
    if (req.body.itemID != null) {
        questionnaire.address = req.body.itemID;
    }

    questionnaire.save()
    res.json({ questionnaire })
})


// items - collection
app.get('/items', [jwtAuth.verifyToken], async (req, res) => {

    //gets info for all homes for logged in user
    const items = await items.find().exec();
    res.json({ items })
})

app.post('/items', [jwtAuth.verifyToken], async (req, res) => {
    // Find the logged in user's My List
    const UserID = req.UserID;
    const myList = await Searches.find({ userID: UserID }).exec();
    const myItems = await items.find({ userID: UserID, item_name: req.body.item_name }).exec();


    if (myItems._id != null) {
        res.status(400).send({ message: "Alert! Duplicate item cannot be added to listings." })
    } else {
        // pushes new home listing into db
        const item = await items.create(req.body);
        res.json({ item });

    }
})


// item details 
app.get('/item/:id', [jwtAuth.verifyToken], async (req, res) => {

    try {
        const items = await items.findById(req.params.id).exec();
        res.json(items)
    } catch {
        console.log(error)
    }

})

app.put('/item/:id', [jwtAuth.verifyToken], async (req, res) => {

    const itemID = req.params.id

    try {
        const item = await items.findByIdAndUpdate(itemID, req.body)

        res.json({ item })
    } catch (error) {
        console.log(error)
    }

    // }
})










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