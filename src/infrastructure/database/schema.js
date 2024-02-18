"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
var mongoose_1 = require("mongoose");
var messageSchema = new mongoose_1.default.Schema({
    message: {
        type: String,
        required: true
    },
    offset: {
        type: String,
        required: true
    },
    createdAt: { type: Date, immutable: true, default: function () { return Date.now(); } },
    chatRoom: {
        type: String,
        required: true
    }
});
var userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, immutable: true, default: function () { return Date.now(); } },
    messages: [messageSchema]
});
var UserModel = mongoose_1.default.model('Users', userSchema);
exports.UserModel = UserModel;
