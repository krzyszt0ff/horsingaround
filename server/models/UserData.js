import mongoose from 'mongoose';
import { UserCredentials } from './UserCredentials.js';
import { UserCredentials } from './UserCredentials.js';

const userDataSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: UserCredentials ,required: true},
    name: {type: String, required: true},
    dateOfBirth: {type: Date, required: true},
    bio: {type: String, required: false},
    gender: {type: String, enum: ["male", "female", "other"], required: true},
    gender: {type: String, enum: ["male", "female", "other"], required: true},
    location: {type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number],
      type: [Number],
      required: true
    }},
    preferred_gender: {type: [String], required: true}, //jako lista, i wtedy we froncie użytkownik zaznacza tyle płci ile chce
    preferred_age: {type: [Number], required: true   }, // lista [min, max]
    preferred_distance: {type: Number, required: true},
    preferred_age: {type: [Number], required: true   }, // lista [min, max]
    preferred_distance: {type: Number, required: true},
    images_paths: {type: [String], required: true}

});
});

userDataSchema.index({location: "2dsphere"})
export const UserData = mongoose.model("UserData", userDataSchema);