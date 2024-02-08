import mongoose from 'mongoose';
import { UserModel } from './schema';

export async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/socket-io-chat');
    console.log('connect to db');
  } catch (error) {
    console.error(error);
  }
}

export async function newUser(newUserName: string, password: string) {
  try {
    const user = await UserModel.create({
      name: newUserName,
      password: password
    });
    await user.save();
    // console.log(`New user created: ${user}`);
  } catch (e: unknown) {
    console.log(e.message);
  }
}

export async function addMessage(
  userName: string,
  newMessage: string,
  offset: string,
  chatRoom: string
) {
  try {
    const user = await UserModel.findOne({ name: userName });
    if (!user) {
      throw new Error(`User not found`);
    }
    user.messages.push({
      message: newMessage,
      offset: offset,
      chatRoom: chatRoom
    });
    await user.save();
    console.log(`Message ${newMessage} added successfully`);
  } catch (e: unknown) {
    console.log(e.message);
  }
}
