// Importing all required external modules after installation
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Middleware
const PORT = 4000;
const app = express();
app.use(express.json());

// Connecting to MongoDB Atlas
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log("DB connection error:", err));

// API Landing page http://localhost:4000/
app.get('/', async (req, res) => {
    try {
        res.send("<h1 align= center>Welcome to the backend and week 2</h1>");
    } catch (err) {
        console.log(err);
    }
});

// API registration page http://localhost:4000/register
app.post('/register', async (req, res) => {
    const { user, email, password } = req.body;

    if (!user || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashPassword = await bcrypt.hash(password, 10);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already taken" });
        }

        const newUser = new User({ user, email, password: hashPassword });
        await newUser.save();
        console.log("New User is registered successfully...");
        res.json({ message: 'User created....' });
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// API Login Page http://localhost:4000/login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        res.json({ message: "Login Successful", username: user.username });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Server Running and Testing
app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("Server is running on port :" + PORT);
});
