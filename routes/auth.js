const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// REGISTER
router.post("/register", async (req, res) => {
    try {
        // generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        // save user and respond
        const user = await newUser.save();
        res.status(200).json(user._id);
    } catch (error) {
        res.status(500).json(error);
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        // Check if the user exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json("User not found");
        }

        // Check if the password is correct
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json("Invalid password");
        }

        // If the user exists and the password is correct, respond with the user ID
        res.status(200).json(user._id);
    } catch (error) {
        res.status(500).json(error);
    }
});


module.exports = router;