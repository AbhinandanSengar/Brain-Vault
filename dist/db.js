"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModel = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const ObjectId = mongoose_1.default.Types.ObjectId;
const UserSchema = new mongoose_2.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const ContentSchema = new mongoose_2.Schema({
    link: { type: String, required: true },
    type: { type: String, enum: ["document", "tweet", "youtube", "link"], required: true },
    title: { type: String, required: true },
    tags: [{ type: mongoose_2.Schema.Types.ObjectId, ref: "Tag" }],
    userId: { type: mongoose_2.Schema.Types.ObjectId, ref: "User", required: true }
});
exports.UserModel = (0, mongoose_2.model)("user", UserSchema);
exports.ContentModel = (0, mongoose_2.model)("content", ContentSchema);
