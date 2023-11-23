const router = require('express').Router();
const User = require('../models/User');

//update user
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        // if the user wants to update the password
        if (req.body.password) {
            try {
                // generate new password
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (error) {
                return res.status(500).json(error);
            }
        }
        try {
            // update the user
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Account has been updated");
        } catch (error) {
            return res.status(500).json(error);
        }
    } else {
        return res.status(403).json("You can update only your account!");
    }
});

//delete user
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            // delete the user
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");
        } catch (error) {
            return res.status(500).json(error);
        }
    } else {
        return res.status(403).json("You can delete only your account!");
    }
});

//get a user
router.get("/:id", async (req, res) => {
    try {
        // get the user
        const user = await User.findById(req.params.id);
        // remove the password and updatedAt
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (error) {
        return res.status(500).json(error);
    }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            // get the user
            const user = await User.findById(req.params.id);
            // get the current user
            const currentUser = await User.findById(req.body.userId);
            // check if the user is not followed
            if (!user.followers.includes(req.body.userId)) {
                // update the user
                await user.updateOne({ $push: { followers: req.body.userId } });
                // update the current user
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("User has been followed");
            } else {
                res.status(403).json("You already follow this user");
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    } else {
        res.status(403).json("You can't follow yourself");
    }
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            // get the user
            const user = await User.findById(req.params.id);
            // get the current user
            const currentUser = await User.findById(req.body.userId);
            // check if the user is followed
            if (user.followers.includes(req.body.userId)) {
                // update the user
                await user.updateOne({ $pull: { followers: req.body.userId } });
                // update the current user
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("User has been unfollowed");
            } else {
                res.status(403).json("You don't follow this user");
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    } else {
        res.status(403).json("You can't unfollow yourself");
    }
});



module.exports = router;