const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// Get user profile
router.get("/profile/:id", auth, userController.getProfile);

const upload = require("../middleware/uploadMiddleware");
// Update user profile
router.put("/profile", auth, upload.single("profilePic"), userController.updateProfile);

// Follow user
router.post("/follow/:id", auth, userController.followUser);

// Unfollow user
router.post("/unfollow/:id", auth, userController.unfollowUser);

module.exports = router;
