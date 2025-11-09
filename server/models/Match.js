import mongoose from 'mongoose';
import { UserCredentials } from './UserCredentials';

const matchSchema = new mongoose.Schema({
    user_A: {type: mongoose.Schema.Types.ObjectId, ref: UserCredentials, required: true},
    user_B: {type: mongoose.Schema.Types.ObjectId, ref: UserCredentials, required: true},
    created_at: {type: Date, default: Date.now}
});

export const Match = mongoose.model("Match", matchSchema);