import mongoose, { Document, Schema, Types } from "mongoose";
const schema = new Schema({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: "chat",
        required: true,
    },
    sender: {
        type: String,
        required: true,
    },
    text: {
        type: String,
    },
    image: {
        url: String,
        publicId: String,
    },
    messageType: {
        type: String,
        enum: ["text", "image"],
        default: "text",
    },
    seen: {
        type: Boolean,
        default: false,
    },
    seenAt: {
        type: Date,
    },
}, { timestamps: true });
export const Messages = mongoose.model("Messages", schema);
//# sourceMappingURL=message.js.map