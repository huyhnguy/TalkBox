const asyncHandler = require("express-async-handler");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const cloudinary = require('cloudinary').v2;
const Notification = require("../models/notification");
const streamifier = require('streamifier');

exports.message_create_post = asyncHandler(async (req, res, next) => {
    try {

        const newMessage = new Message({
            user: req.user.id,
            content: req.body.new_message,
        })

        if (req.file) {
            /*const options = {
                public_id: newMessage._id,
                overwrite: true,
              };              
            const image = await cloudinary.uploader.upload(req.file.path , options);
            newMessage.image = image.secure_url;*/

            const image = cloudinary.uploader.upload_stream(
                { 
                    folder: 'uploads',
                    public_id: newMessage._id,
                    overwrite: true 
                },
                async (error, result) => {
                  if (error) {
                    return res.status(500).send(error);
                  }
                  console.log(result.secure_url);
                  newMessage.image = result.secure_url;
                  await newMessage.save();
                }
              );

            streamifier.createReadStream(req.file.buffer).pipe(image);
        }

        const [newMessageSave, newMessagePopulated, conversation] = await Promise.all([ 
            newMessage.save(), 
            newMessage.populate('user', 'id'), 
            Conversation.findById(req.body.conversation_id).exec()
        ])
        conversation.history.push(newMessage._id);
        await conversation.save();

        const otherUserArray = conversation.users.filter((userId) => userId != req.user.id);

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        if (req.body.conversation_type === "Group") {
            const recentNotifications = await Notification.exists({ 
                to: otherUserArray, 
                from: conversation._id,
                from_type: 'Conversation',
                conversation_id: conversation._id,
                update: "You have new messages.",
                createdAt: { $gte: tenMinutesAgo }
            });

            if (!recentNotifications) {
                const notification = new Notification({
                    to: otherUserArray,
                    from: conversation._id,
                    from_type: 'Conversation',
                    conversation_id: conversation._id,
                    update: "You have new messages.",
                })
        
                await notification.save();
            }
    
        } else {
            const recentNotifications = await Notification.exists({ 
                to: otherUserArray, 
                from: req.user.id,
                from_type: 'User',
                conversation_id: conversation._id,
                update: "sent you a message.",
                createdAt: { $gte: tenMinutesAgo }
            });

            if (!recentNotifications) {
                const notification = new Notification({
                    to: otherUserArray,
                    from: req.user.id,
                    from_type: 'User',
                    conversation_id: conversation._id,
                    update: "sent you a message.",
                })
    
                await notification.save();
            }
        }

        res.json({ new_message: newMessagePopulated , message: "Message successfully created and saved into the conversation" })
    } catch (err) {
        console.error('error saving conversation:', err);

        res.status(400).send({ message: "Error creating message" });
    }
})

exports.message_update = asyncHandler(async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.messageId).exec();
        message.content = req.body.new_message;

        if (req.file) {
            /*const options = {
                public_id: message._id,
                overwrite: true,
              };              
            const image = await cloudinary.uploader.upload(req.file.path , options);
            message.image = image.secure_url;*/

            const image = cloudinary.uploader.upload_stream(
                { 
                    folder: 'uploads',
                    public_id: message._id,
                    overwrite: true 
                },
                async (error, result) => {
                  if (error) {
                    return res.status(500).send(error);
                  }
                  console.log(result.secure_url);
                  message.image = result.secure_url;
                  await message.save();
                }
              );

            streamifier.createReadStream(req.file.buffer).pipe(image);
        } else if (!req.body.image_same) {
            message.image = null;
        }
        
        const [saveMessage, populatedMessage] = await Promise.all([
            message.save(),
            message.populate('user', 'display_name')
        ])

        res.json({ updated_message: populatedMessage, message: "message successfully updated"})
    } catch (err) {
        console.error(err);

        res.json({ message: "message could not be updated", error: err})
    }
})

exports.message_delete = asyncHandler(async (req, res, next) => {
    try {
        await Promise.all([
            cloudinary.uploader.destroy(req.params.messageId, function(result) { console.log(result) }),
            Conversation.findOneAndUpdate({ _id: req.body.conversation_id}, { $pull: { history: req.params.messageId } }).exec(),
            Message.findByIdAndDelete(req.params.messageId).exec()
        ])
        
        res.json({ message: "message successfully deleted" })
    } catch (err) {
        console.log(err);

        res.json({ message: "message could not be deleted", error: err})
    }
})