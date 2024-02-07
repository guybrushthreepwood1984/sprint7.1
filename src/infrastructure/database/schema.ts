import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  offset: {
    type: String,
    required: true
  },
  createdAt: { type: Date, immutable: true, default: () => Date.now() },
  chatRoom: {
    type: String,
    required: true
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, immutable: true, default: () => Date.now() },
  messages: [messageSchema]
});

const UserModel = mongoose.model('Users', userSchema);

export { UserModel };
