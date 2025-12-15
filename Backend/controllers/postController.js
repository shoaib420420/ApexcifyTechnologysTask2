const Post = require("../models/Post");

exports.createPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : "";

        if (!caption && !image) {
            return res.status(400).json({ success: false, message: "Caption or image is required" });
        }

        const post = await Post.create({
            user: req.user.id,
            caption,
            image
        });

        const populatedPost = await post.populate("user", "username profilePic");
        res.json({ success: true, post: populatedPost });
    } catch (error) {
        console.error("Create Post Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "username profilePic")
            .sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (error) {
        console.error("Get All Posts Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("user", "username profilePic")
            .populate({
                path: "comments",
                populate: { path: "user", select: "username profilePic" }
            });

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.json({ success: true, post });
    } catch (error) {
        console.error("Get Post By ID Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const isLiked = post.likes.includes(req.user.id);
        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== req.user.id);
        } else {
            post.likes.push(req.user.id);
        }

        await post.save();
        res.json({ success: true, likes: post.likes });
    } catch (error) {
        console.error("Like Post Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found or unauthorized" });
        }
        res.json({ success: true, message: "Post deleted" });
    } catch (error) {
        console.error("Delete Post Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
