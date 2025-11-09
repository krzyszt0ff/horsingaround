import mongoose from 'mongoose';
import { UserCredentials } from './UserCredentials';

const likeSchema = new mongoose.Schema({
    from_user: {type: mongoose.Schema.Types.ObjectId, ref: UserCredentials, required: true},
    to_user: {type: mongoose.Schema.Types.ObjectId, ref: UserCredentials, required: true},
    created_at: {type: Date, default: Date.now}
});

export const Like = mongoose.model("Like", likeSchema);