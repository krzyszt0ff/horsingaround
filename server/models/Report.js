import mongoose from 'mongoose';
import { UserCredentials } from './UserCredentials.js';

const reportSchema = new mongoose.Schema({
    reporter_id: {type: mongoose.Schema.Types.ObjectId, ref: UserCredentials, required: true},
    reported_user_id: {type: mongoose.Schema.Types.ObjectId, ref: UserCredentials, required: true },
    created_at: {type: Date, default: Date.now},
    text_content: {type: String, required: false},
    inspected: {type: Boolean, default: false}
});

export const Report = mongoose.model("Report", reportSchema);