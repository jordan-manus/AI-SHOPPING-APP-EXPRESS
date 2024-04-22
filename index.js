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
const web_scrapping = require('./web_scrapping.jsx')

// getting the Models to query the DB
const User = require('./models/users.js')
const items = require('./models/items.js')
const orders = require('./models/orders.js');
const verifyLogin = require("./middleware/verifyLogin");
const Blacklist = require("./models/blacklist.js");
const { error } = require("console");
const questionnaire = require('./models/questionnaire.js')



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
    const userPref = await questionnaire.create(req.body)
    res.json({ userPref })
})

app.get('/questionnaire', [jwtAuth.verifyToken], async (req, res) => {
    const UserID = req.UserID;
    Object.assign(req.body, { UserID });
    try {
        const userPref = await questionnaire.findOne({ UserID: UserID });
        res.json(userPref)
    } catch {
        res.status(500).json(Error)
    }
})

app.put('/questionnaire', [jwtAuth.verifyToken], async (req, res) => {
    const UserID = req.UserID;
    const questionnaireArray = await questionnaire.find({ UserID: UserID });
    //Removes userPref from the array it was returned in
    const userPref = questionnaireArray[0]
    if (req.body.itemID != null) {
        questionnaire.itemID = req.body.itemID;
    }

    questionnaire.save()
    res.json({ questionnaire })
})


// items - collection
app.get('/items', [jwtAuth.verifyToken], async (req, res) => {

    //gets info for all homes for logged in user
    // try {
    //     const myItems = await items.find().exec();
    //     res.json({ myItems })
    // } catch (error) {
    //     console.log(error)
    // }
    const item_cat = req.body.accessToken
    const url = "https:amazon.com/0" + item_cat
    web_scrapping(url)
})

app.post('/items', [jwtAuth.verifyToken], async (req, res) => {
    // Find the logged in user's My List
    const UserID = req.UserID;
    const myItems = await items.find({ userID: UserID, item_name: req.body.item_name }).exec();


    // does not prevent duplicate adds
    if (myItems._id != null) {
        res.status(400).send({ message: "Alert! Duplicate item cannot be added to listings." })
    } else {
        // pushes new home listing into db
        const item = await items.create(req.body);
        res.json({ item });

    }
})


// item details 
app.get('/items/:id', [jwtAuth.verifyToken], async (req, res) => {
    const itemID = req.params.id

    try {
        const myItems = await items.findById(itemID).exec();
        res.json(myItems)
    } catch (error) {
        console.log(error)
    }

})

app.put('/items/:id', [jwtAuth.verifyToken], async (req, res) => {

    const itemID = req.params.id

    try {
        const myItem = await items.findByIdAndUpdate(itemID, req.body)

        res.json({ myItem })
    } catch (error) {
        console.log(error)
    }

    // }
})


// image creation endpoint
app.put('/tryon', [jwtAuth.verifyToken], async (req, res) => {
    let selfie = req.params.selfie
    let referencePic = req.params.item_name


    const response = await openai.images.edit({
        model: "dall-e-2",
        image: fs.createReadStream({ selfie }),
        mask: fs.createReadStream("mask.png"),
        prompt: `A person using ${referencePic}`,
        n: 1,
        size: "1024x1024"
    });
    image_url = response.data[0].url;

})


// object detection endpoint
app.put('/findItem', [jwtAuth.verifyToken], async (req, res) => {
    // let image = req.params.image

    // OpenAI API Key
    const apiKey = process.env.OPENAI_API_KEY;

    // Function to encode the image
    function encodeImage(imagePath) {
        const imageBuffer = fs.readFileSync(imagePath);
        return imageBuffer.toString('base64');
    }

    // Path to your image
    const imagePath = req.params.image;

    // Getting the base64 string
    const base64Image = encodeImage(imagePath);

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
    };

    const payload = {
        "model": "gpt-4-turbo",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What’s in this image?"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": `data:image/jpeg;base64,${base64Image}`
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    };

    request.post({
        url: "https://api.openai.com/v1/chat/completions",
        headers: headers,
        json: payload
    }, (error, response, body) => {
        if (error) {
            console.error('Error:', error);
            return;
        }
        console.log(body);
    });


    // object_detection(imagePath)
    //     .then(async (results) => {
    //         item_info = results
    //         // add in image scraping from Amazon for similar items for sale

    //         Object.assign(req.body, {})
    //     })
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