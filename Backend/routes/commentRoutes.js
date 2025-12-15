const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const auth = require("../middleware/auth");

// Add comment
router.post("/:postId", auth, commentController.addComment);

// Get comments of a post
router.get("/:postId", commentController.getComments);

// Delete comment
router.delete("/:id", auth, commentController.deleteComment);

module.exports = router;
