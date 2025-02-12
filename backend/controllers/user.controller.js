import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';

export const getUserProfile = async (req, res) => {
   const { username } = req.params;
   try {
      const user = await User.findOne({ username }).select('-password');
      if (!user) return res.status(404).json({ eror: 'User not found' });
      res.status(200).json(user);
   } catch (err) {
      console.log(`Error in getUserProfile controller: ${err.message}`);
      return res
         .status(500)
         .json({ success: false, message: 'Internal Server Error' });
   }
};
export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const usersFollowedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                },
            },
            { 
                $sample: { size: 10 }
            }
        ]);
        
        const filteredUsers = users.filter(e=> !usersFollowedByMe.following.includes(req.user._id));
        const sugestedUsers =filteredUsers.slice(0,4);
        const noPassSugested = sugestedUsers.map(user => delete user.password );
        res.status(200).json(noPassSugested);
    } catch (err) {
        console.log(`Error in getSuggestedUsers controller: ${err.message}`);
        console.log(err);
        
        return res
           .status(500)
           .json({ success: false, message: 'Internal Server Error' });
    }

};
export const followUnfollowUser = async (req, res) => {
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id == req.user._id) return res.status(400).json({error: "You cannot follow or unfollow yourself"})

        if(!userToModify || !currentUser)  return res.status(404).json({error: "User not found"})

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing) {
            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}})
            res.status(200).json({message: "Unfollowed"});
        } else {
            // follow that user
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}})
            
            // send a notification to that user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: id
            })
            newNotification.save();

            res.status(200).json({message: "Followed"});            
        }
        
    } catch (err) {
        
    }

};
export const updateUserProfile = async (req, res) => {
    try {
        
    } catch (err) {
        
    }

};
