const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const auth = require("../middleware/auth");

const upload = require("../middleware/uploadMiddleware");

// Create post
router.post("/", auth, upload.single("image"), postController.createPost);

// Get all posts
router.get("/", postController.getAllPosts);

// Get single post
router.get("/:id", postController.getPostById);

// Like post
router.post("/like/:id", auth, postController.likePost);


// Delete post
router.delete("/:id", auth, postController.deletePost);

module.exports = router;
