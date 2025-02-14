import Notification from "../models/notification.model.js";



export const getNotifications = async (req, res) => {
    const userId = req.user._id;

    const notifications = await Notification.find({to: userId})
    .sort({createdAt: -1})
    .populate({
        path: "from",
        select: "-password"
    });

    res.status(200).json(notifications);
    // Read all of the notifications after they we're shown.
    // TODO: Not schematic approach, could be better
    await Notification.updateMany({to: userId}, {read: true});

   try {
   } catch (err) {
      console.log('Error in user.controller.js: ' + err.message);
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};

export const deleteNotifications = async (req, res) => {
    const userId = req.user._id;
    try {
        await Notification.deleteMany({to: userId});
        res.status(200).json({message: "Notifications deleted successfully"})
        
    } catch (err) {
        console.log('Error in user.controller.js: ' + err.message);
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
     }
}