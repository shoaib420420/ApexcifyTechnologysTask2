const Comment = require("../models/Comment");
const Post = require("../models/Post");

exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { postId } = req.params;

        if (!text) {
            return res.status(400).json({ success: false, message: "Comment text required" });
        }

        const comment = await Comment.create({
            post: postId,
            user: req.user.id,
            text
        });

        await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

        const populatedComment = await comment.populate("user", "username profilePic");

        res.json({ success: true, comment: populatedComment });
    } catch (error) {
        console.error("Add Comment Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate("user", "username profilePic")
            .sort({ createdAt: -1 });

        res.json({ success: true, comments });
    } catch (error) {
        console.error("Get Comments Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (comment) {
            await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Delete Comment Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
