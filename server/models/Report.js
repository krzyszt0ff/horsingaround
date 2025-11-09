import mongoose from 'mongoose';
import { UserCredentials } from './UserCredentials';

const reportSchema = new mongoose.Schema({
    reported_user_id: {type: mongoose.Schema.Types.ObjectId, ref: UserCredentials, required: true },
    created_at: {type: Date, default: Date.now},
    inspected: {type: Boolean, default: false}
});

export const Report = mongoose.model("Report", reportSchema);