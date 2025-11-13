import mongoose from 'mongoose';

const userCredentialsSchema = new mongoose.Schema({
    email: {type: String, required: true},
    password_hash: {type: String, required: true},
    role: {type: String, enum: ["user", "admin"], required: true}
});

export const UserCredentials = mongoose.model("UserCredentials", userCredentialsSchema);