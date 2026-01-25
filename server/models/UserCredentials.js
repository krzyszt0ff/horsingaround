import mongoose from 'mongoose';

const userCredentialsSchema = new mongoose.Schema({
    email: {type: String, required: true},
    password_hash: {type: String, required: true},
    role: {type: String, enum: ["User", "Admin"], required: true},

    isDeleted:{type: Boolean, default: false}
});

export const UserCredentials = mongoose.model("UserCredentials", userCredentialsSchema);