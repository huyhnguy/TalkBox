const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  display_name: { type: String, maxLength: 100 },
  profile_picture: String
});

module.exports = mongoose.model("Conversation", ConversationSchema);