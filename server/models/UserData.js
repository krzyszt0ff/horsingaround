import mongoose from 'mongoose';

const userDataSchema = new mongoose.Schema({
    user_id: {type: String, required: true},
    name: {type: String, required: true},
    dateOfBirth: {type: Date, required: true},
    bio: {type: String, required: false},
    gender: {type: String, enum: ["male", "female", "other"]},
    location: {type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }},
    preferred_gender: {type: [String], required: true}, //jako lista, i wtedy we froncie użytkownik zaznacza tyle płci ile chce
    age_preference: {type: [number], required: true}, // [min, max]
    preferred_distance: {type: number, required: true},
    images_paths: {type: [String], required: true}

});

userDataSchema.index({location: "2dsphere"})
export const UserData = mongoose.model("UserData", userDataSchema);