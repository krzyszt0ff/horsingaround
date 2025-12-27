import mongoose from 'mongoose';
import { UserCredentials } from './UserCredentials.js';

const userDataSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: UserCredentials ,required: true},
    name: {type: String, required: true},
    date_of_birth: {type: Date, required: true},
    bio: {type: String, required: true},
    gender: {type: String, enum: ["male", "female", "other"], required: true},
   
    location: {type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }},
    preferred_gender: {type: [String], required: true}, //jako lista, i wtedy we froncie użytkownik zaznacza tyle płci ile chce
    preferred_min_age: {type: Number, required: true},
    preferred_max_age: {type: Number, required: true},
    preferred_distance: {type: Number, required: true},
    images_paths: {type: [String], required: true}

});

userDataSchema.index({location: "2dsphere"})
export const UserData = mongoose.model("UserData", userDataSchema);