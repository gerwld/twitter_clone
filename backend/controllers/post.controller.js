import { v2 } from "cloudinary";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getAllPosts = async (req,res) => {
try {
    const posts = await Post.find().sort({createdAt: -1})
    .populate({
        path: "user",
        select: "-password"
    })
    .populate({
        path: "comments.user",
        select: "-password"
    });
    if(posts.length == 0) {
        return res.status(200).json([]);
    }     
    res.status(200).json(posts);
} catch (err) {
    console.log("Error in getAllPosts (post.controller.js)", err);
    res.status(500).json({error: "Internal Server Error"});
}
}

export const getUserPosts = async (req,res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username});
        if(!user) {
            return res.status(404).json({error: "User not found"});
        }

        const posts = await Post.find({user: user._id})
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(posts);
    } 
    catch (err) {
        console.log("Error in getUserPosts (post.controller.js)", err);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const getFollowPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const following = await User.findById(userId).select("following");

        const posts = await Post.find({user: {$in: following}})
        .sort({createdAt: -1})
        .populate({
            path: "comments.user",
            select: "-password"
        });

        return res.json(posts);
        
    } catch (err) {
        console.log("Error in getFollowPosts (post.controller.js)", err);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const createPost = async (req, res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;

        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if(!text && !img) {
            return res.status(400).json({ error: 'Post should have text or image' }); 
        }

        if(img) {
           const uploadedResponse = await v2.uploader.upload(img);
           img = uploadedResponse.secure_url; 
        }

        const newPost = new Post({
            user: userId,
            text,
            img
        })

        await newPost.save();
        res.status(201).json(newPost);

    } catch (err) {
       console.log("Error in createPost (post.controller.js)");
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }

}


export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        
        if(!post) {
           return res.status(404).json({error: "Post not found"});
        }

        const userLikedPost = post.likes.includes(userId);

        if(!userLikedPost) {
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}});
            await Post.updateOne({_id: postId}, {$push: {likes: userId}});
            

            const notification = new Notification({
                // title: `User ${req.user.username} liked your post ${post.title}`,
                from: userId,
                to: post.user,
                type: "like"
            })
            await notification.save();
            return res.status(200).json({message: "Post liked"});
        } 
        else {
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}});
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
            return res.status(200).json({message: "Post unliked"});
        }

    } catch (err) {
        console.log("Error in likeUnlikePost (post.controller.js)");
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }

}


export const commentOnPost = async (req, res) => {
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text) {
           return res.status(400).json({error: "Comment should contain text field"});
        }
        const post = await Post.findById(postId);
        if(!post) {
           return res.status(404).json({error: "Post not found"});
        }

        const comment = {user: userId, text};

        post.comments.push(comment);

        post.save();
        res.status(200).json({message: "Comment addded"})

    } catch (err) {
        console.log("Error in commentOnPost (post.controller.js)");
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }

}


export const deletePost = async (req, res) => {
    
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(400).json({ error: 'Post not found' });

        
        

        if(!post.user.equals(req.user._id)) {
            return res.status(400).json({ error: 'You are not authorized to delete this post' });
        }

        if(post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await v2.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted successfully' });

    } catch (err) {
        console.log("Error in deletePost (post.controller.js)");
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }

}


export const getLikedPosts = async (req, res) => {
    console.log("triggered");
    
    try {
       const userId = req.params.id;
       const user = await User.findById(userId);
       if (!user) {
          return res.status(404).json({ error: 'User not found' });
       }
 
       const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
       .populate({
        path: "user",
        select: "-password"
       }).populate({
        path: "comments.user",
        select: "-password"
       });

       if (likedPosts.length === 0) {
          return res.status(200).json([]);
       }
       res.json(likedPosts);

    } catch (err) {
       console.log('Error in getAllPosts (post.controller.js)', err);
       res.status(500).json({ error: 'Internal Server Error' });
    }
 };
 