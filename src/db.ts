import mongoose from "mongoose";
import { model, Schema } from "mongoose"
const ObjectId = mongoose.Types.ObjectId;

const UserSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

export const UserModel = model("user", UserSchema);