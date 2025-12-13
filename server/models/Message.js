import mongoose from 'mongoose';
import { UserCredentials } from './UserCredentials.js';

const messageSchema = new mongoose.Schema({
    match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true},
    from_user: {type: mongoose.Schema.Types.ObjectId, ref: UserCredentials, required: true},
    to_user: {type: mongoose.Schema.Types.ObjectId, ref: UserCredentials, required: true},
    created_at: {type: Date, default: Date.now},
    content: {type: String, required: true},
    is_read: {type: Boolean, required: true}
});

export const Message = mongoose.model("Message", messageSchema);