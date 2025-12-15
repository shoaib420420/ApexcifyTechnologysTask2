const User = require("../models/User");
const Post = require("../models/Post");

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate("followers", "username profilePic")
            .populate("following", "username profilePic");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const posts = await Post.find({ user: req.params.id }).sort({ createdAt: -1 });

        res.json({ success: true, user, posts });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { bio } = req.body;
        const profilePic = req.file ? `/uploads/${req.file.filename}` : undefined;

        const updateData = {};
        if (bio) updateData.bio = bio;
        if (profilePic) updateData.profilePic = profilePic;

        const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password");

        res.json({ success: true, user });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.followUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const followId = req.params.id;

        if (userId === followId) {
            return res.status(400).json({ success: false, message: "Cannot follow yourself" });
        }

        await User.findByIdAndUpdate(userId, { $addToSet: { following: followId } });
        await User.findByIdAndUpdate(followId, { $addToSet: { followers: userId } });

        res.json({ success: true, message: "Followed" });
    } catch (error) {
        console.error("Follow User Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const unfollowId = req.params.id;

        await User.findByIdAndUpdate(userId, { $pull: { following: unfollowId } });
        await User.findByIdAndUpdate(unfollowId, { $pull: { followers: userId } });

        res.json({ success: true, message: "Unfollowed" });
    } catch (error) {
        console.error("Unfollow User Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
