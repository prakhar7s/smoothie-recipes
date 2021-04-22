const express = require("express");
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
require('dotenv').config();

const app = express();

// middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

//view engine
app.set("view engine", "ejs");

const PORT = process.env.PORT || 5000;

// Database connection
const dbURL = process.env.DB_URL;
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true})
    .then((result) =>{
        // Start the server
        app.listen(PORT, function () {
            console.log('CONNECTED TO DB');
        });
    })
    .catch((err) => console.log(err));

//All get requests
app.get('*', checkUser);

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/smoothies', requireAuth,  (req, res) => {
    res.render('smoothies');
});

// Auth Routes
app.use(authRoutes);


