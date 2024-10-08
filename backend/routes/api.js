const express = require("express");
const router = express.Router();
require("dotenv").config();
const { authenticateToken } = require('../middleware/authenticateToken');
const upload = require('../middleware/multer-config');
const userController = require("../controllers/userController");
const conversationController = require("../controllers/conversationController");
const messageController = require('../controllers/messageController');
const notificationController = require('../controllers/notificationController');

router.post("/login", userController.login_post);

router.post("/logout", userController.logout);

router.post("/signup", userController.signup_post);

router.get("/users", authenticateToken, userController.users_list);

router.get("/users/settings", authenticateToken, userController.user_profile_get);

router.put("/users/settings", authenticateToken, upload.single('profile_picture'), userController.user_profile_put);

router.get("/users/:userId", authenticateToken, userController.user_get);

router.put("/users/:userId", authenticateToken, userController.user_update);

router.delete("/users/:userId", userController.user_delete);

router.get("/groups", authenticateToken, conversationController.groups_list_get);

router.post("/groups/create", authenticateToken, upload.single('group_picture'), conversationController.groups_create_post);

router.get("/groups/:groupId", authenticateToken, conversationController.group_get);

router.get("/groups/:groupId/settings", authenticateToken, conversationController.group_settings_get);

router.put("/groups/:groupId/settings", authenticateToken, upload.single('profile_picture'), conversationController.group_settings_put);

router.delete("/groups/:groupId/settings", authenticateToken, conversationController.group_settings_delete);

router.put("/groups/:groupId/users/:userId", authenticateToken, conversationController.group_user_put);

router.delete("/groups/:groupId/users/:userId", authenticateToken, conversationController.group_user_delete);

router.get("/dms", authenticateToken, conversationController.dms_list_get);

router.post("/dms/create", authenticateToken, conversationController.dms_create_post);

router.get("/dms/:dmId", authenticateToken, conversationController.dm_get);

router.post("/messages/create", authenticateToken, upload.single('image'), messageController.message_create_post);

router.put("/messages/:messageId", authenticateToken, upload.single('image'), messageController.message_update);

router.delete("/messages/:messageId", authenticateToken, messageController.message_delete);

router.get("/notifications", authenticateToken, notificationController.notification_list_get);

router.get("/notifications/counter", authenticateToken, notificationController.new_notification_counter_get);

router.put("/notifications", authenticateToken, notificationController.notification_list_put);

router.put("/notifications/:notificationId", authenticateToken, notificationController.notification_put);

module.exports = router;