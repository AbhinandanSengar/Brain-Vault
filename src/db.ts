import mongoose from "mongoose";
import { model, Schema } from "mongoose"
const ObjectId = mongoose.Types.ObjectId;

const UserSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const ContentSchema = new Schema({
    link: { type: String, required: true },
    type: { type: String, enum: ["document", "tweet", "youtube", "link"] , required: true },
    title: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
});

export const UserModel = model("user", UserSchema);
export const ContentModel = model("content", ContentSchema);