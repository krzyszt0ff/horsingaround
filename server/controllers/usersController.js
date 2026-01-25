import { UserData } from "../models/UserData.js";
import { UserCredentials } from "../models/UserCredentials.js";
import { Like } from "../models/Like.js";
import { Match } from "../models/Match.js";
import { Report } from "../models/Report.js";
import { getDistance } from 'geolib';
import mongoose from 'mongoose';
import * as z from 'zod';
import fs from 'fs';
import path from "path";
import { profileSchema } from "../schemas/profileSchema.js";


function calculateAge(birthDate) {

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  if (today.getMonth() < birthDate.getMonth()) {
    age -= 1;
  }

  if (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) {
    age -= 1;
  }

  return age;
};

async function deleteUploadedFiles(files) {
  if (!files || !Array.isArray(files) || files.length === 0) {
        return; // Exit early if there are no files
    }

  try {
    for (const file of files) {
      await fs.promises.unlink(file.path);
      console.log('Deleted file:', file.path);
    }
  } catch (err) {
    console.error('Error deleting uploaded files:', err);
  }
}

//Pobieranie przefiltrowanych danych użytkowników
export async function listUsers(req, res) {

  let page = parseInt(req.query.page, 10);
  if (isNaN(page) || page < 1) page = 1;

  const deletedIds = await UserCredentials
  .find({ isDeleted: true })
  .distinct("_id");

  const page_size = 10;
  const user = new mongoose.Types.ObjectId(req.user.userId);

  const userProfile = await UserData.findOne({ user_id: user });

  if (userProfile === null) {
    return res.status(404).json({ success: false, error: "User's profile cannot be found" });
  }
  const genderFilter = req.query.gender 
    ? [req.query.gender]
    : userProfile.preferred_gender;
  const minAge = parseInt(req.query.minAge) || userProfile.preferred_min_age;
  const maxAge = parseInt(req.query.maxAge) || userProfile.preferred_max_age;
  const distance = parseInt(req.query.distance) || userProfile.preferred_distance;

  const { gender, location, preferred_gender, preferred_min_age, preferred_max_age, preferred_distance } = userProfile;

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());

  const preferred_distance_m = preferred_distance * 1000;
//  maxDistance: preferred_distance_m, zmieniam na chwile
/*gender: { $in: preferred_gender },
            preferred_gender: gender,
            date_of_birth: { $gte: minDate, $lte: maxDate }*/
  try {
    page = parseInt(page, 10) || 1;

    const users = await UserData.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: location.coordinates },
          distanceField: "distance",
          maxDistance: distance * 1000,
          query: {
            user_id: { $ne: user,$nin: deletedIds },
            gender: { $in: genderFilter },
            preferred_gender: gender,
            date_of_birth: { $gte: minDate, $lte: maxDate }
            
          },
          spherical: true
        }
      },
      {
        $addFields: {
          age: {
            $dateDiff: {
              startDate: "$date_of_birth",
              endDate: today,
              unit: "year"
            }
          },
          distance_km: { $round: [{ $divide: ["$distance", 1000] }, 1] }
        }
      },
      {
        $lookup: {
          from: "matches",
          let: { otherUserId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $and: [{ $eq: ["$user_A", "$$otherUserId"] }, { $eq: ["$user_B", user] }] },
                    { $and: [{ $eq: ["$user_B", "$$otherUserId"] }, { $eq: ["$user_A", user] }] }
                  ]
                }
              }
            }
          ],
          as: "existing_match"
        }
      },
      {
        $match: { existing_match: { $size: 0 } }
      },
      { $project: { existing_match: 0 } },
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [
            { $skip: (page - 1) * page_size },
            { $limit: page_size }
          ]
        }
      }
    ]);

    const totalCount = users[0]?.metadata[0]?.totalCount || 0;
    return res.status(200).json({
      success: true, metadata: { totalCount, page, page_size }, data: users[0]?.data || []
    });

  }

  catch (err) {
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    return res.status(500).json({ success: false, error: "A database error has occured" });
  }

}

//Pobieranie danych innego użytkownika
export async function showUser(req, res) {

  const id = req.user.userId;
  const user = await UserData.findOne({ user_id: id });

  if (!user) {
    return res.status(404).json({ success: false, error: "User profile not found" });
  }


  const otherId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(otherId)) {
    return res.status(400).json({ success: false, error: "Invalid user id" });
  };

  if (otherId === id) {
    return res.status(400).json({ success: false, error: "You cannot display your own profile with this endpoint" });
  }

  const otherUser = await UserData.findOne({ user_id: otherId });

  if (!otherUser) {
    return res.status(404).json({ success: false, error: "User profile not found" });
  }

  const age = calculateAge(otherUser.date_of_birth);
  const distance = getDistance(
    { latitude: user.location.coordinates[1], longitude: user.location.coordinates[0] },
    { latitude: otherUser.location.coordinates[1], longitude: otherUser.location.coordinates[0] },
    100);

  res.json({ success: true, data: { user: otherUser, age: age, distance_km: distance / 1000 } });
}

//Pobieranie własnego profilu
export async function showMyProfile(req, res) {
  try {
    const id = req.user.userId;

    const userDoc = await UserData.findOne({ user_id: id });

    if (!userDoc) {
      return res.status(404).json({ success: false, error: "User profile not found" });
    }

    // ✅ pobierz credentials (email, role, isDeleted)
    const creds = await UserCredentials.findById(id).select("email role isDeleted");

    // ✅ zamień na zwykły obiekt i doklej role/email, ale NIE zmieniaj nazwy "user"
    const user = userDoc.toObject();
    if (creds) {
      user.email = creds.email;
      user.role = creds.role;
      user.isDeleted = creds.isDeleted;
    }

    const age = calculateAge(user.date_of_birth);

    return res.json({ success: true, data: { user: user, age: age } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}


//Tworzenie danych profilu
export async function addUser(req, res) {

  console.log(req.files);
  console.log(req.body);
  const id = req.body.user_id;

  const result = profileSchema.safeParse(req.body);

  if (!result.success) {
    if (req.files && req.files.length > 0) {
      await deleteUploadedFiles(req.files);
    }
    return res.status(400).json({ success: false, error: z.flattenError(result.error) });
  }

  const { name, date_of_birth, bio, gender, longitude, latitude, preferred_gender, preferred_min_age, preferred_max_age, preferred_distance } = result.data;

  const photos = req.files || [];

  if (photos.length === 0) {
    return res.status(400).json({ success: false, error: "At least one profile image is required" });
  }

  let images_paths = [];


  for (let i = 0; i < photos.length; i++) {
    images_paths.push(`/uploads/${photos[i].filename}`);
  };

  const coordinates = [longitude, latitude];

  const user = await UserData.findOne({ user_id: id });

  if (user !== null) {
    await deleteUploadedFiles(req.files);
    return res.status(409).json({ success: false, error: "User's profile already exists" });
  }

  const newProfile = {
    user_id: id,
    name: name,
    date_of_birth: date_of_birth,
    bio: bio,
    gender: gender,
    location: {
      type: "Point",
      coordinates: coordinates
    },
    preferred_gender: preferred_gender,
    preferred_min_age: preferred_min_age,
    preferred_max_age: preferred_max_age,
    preferred_distance: preferred_distance,
    images_paths: images_paths
  };

  try {
    await UserData.create(newProfile);
  }
  catch (err) {
    await deleteUploadedFiles(req.files);
    console.error(`An error occured while trying to insert new UserData object: ${err}`);
    return res.status(500).json({ success: false, error: "A database error has occured" });
  }

  res.status(201).json({ success: true, data: newProfile });
};

//Aktualizacja danych w profilu zalogowanego użytkownika
export async function updateUser(req, res) {

  const id = req.params.id;
  const userId = req.user.userId;

  if (id!==userId){
    await deleteUploadedFiles(req.files);
    return res.status(400).json({success: false, error: "You cannot modify another users profile"});
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    await deleteUploadedFiles(req.files);
    return res.status(400).json({ success: false, error: "Invalid user id" });
  }

  const user = await UserData.findOne({ user_id: id });

  if (!user) {
    await deleteUploadedFiles(req.files);
    return res.status(404).json({ success: false, error: "User profile not found" });
  }

  const patchSchema = profileSchema.partial();
  const result = patchSchema.safeParse(req.body);

  if (!result.success) {
    await deleteUploadedFiles(req.files);
    return res.status(400).json({ success: false, error: z.flattenError(result.error) });
  }

  const updateData = result.data;

  if (updateData.latitude !== undefined && updateData.longitude !== undefined) {
    updateData.location = {
      coordinates: [updateData.longitude, updateData.latitude]
    }
    delete updateData.latitude;
    delete updateData.longitude;
  }

  else if (updateData.latitude !== undefined || updateData.longitude !== undefined) {
    await deleteUploadedFiles(req.files);
    return res.status(400).json({ success: false, error: "Both latitude and longitude must be provided together" });
  }

  let newUserImages = [...user.images_paths];
  const photosToDelete = req.body.photos_to_delete || [];


  if (photosToDelete.length > 0) {
  newUserImages = newUserImages.filter(img => {
    const filename = path.basename(img);
    return !photosToDelete.includes(filename);
  });
}

  const newPhotos = req.files || [];

  if (newPhotos.length > 0) {
    for (let i = 0; i < newPhotos.length; i++) {
      newUserImages.push(`/uploads/${newPhotos[i].filename}`);
    }
  }

  if (newUserImages.length === 0) {
    await deleteUploadedFiles(req.files);
    return res.status(400).json({ success: false, error: "At least one profile image is required" });
  }

  if (photosToDelete.length > 0) {
    try {
      await Promise.all(
        photosToDelete.map(path =>
          fs.promises.unlink(path).catch(err =>
            console.error(`Failed to delete ${path}:`, err)
          )
        )
      );
    } catch (err) {
      console.error('Error deleting photos:', err);
    }
  }


  try {
    const updatedUser = await UserData.findOneAndUpdate(
      { user_id: id },
      { $set: { ...updateData, images_paths: newUserImages } },
      { new: true }
    );

    return res.json({ success: true, data: updatedUser });
  } catch (err) {
    await deleteUploadedFiles(req.files);
    console.error(`An error occured while trying to update the UserData object: ${err}`);
    return res.status(500).json({ success: false, error: "A database error has occurred" });
  }


}



export async function reportUser(req, res) {

  const id = req.user.userId;
  const otherId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(otherId)) {
    return res.status(400).json({ success: false, error: "Invalid user id" });
  }

  const otherUser = await UserCredentials.findById(otherId);

  if (!otherUser) {
    return res.status(404).json({ success: false, error: "Reported user not found" });
  }

  const textContentSchema = z.string().trim().nonempty().optional();
  const result = textContentSchema.safeParse(req.body.text_content);

  if (!result.success) {
    return res.status(400).json({ success: false, error: z.flattenError(result.error) });
  }

  const textContent = result.data;

  const now = new Date();

  const newReport = {
     user_id: id,                    // zamiast reporter_id
  reported_user_id: otherId,       // zostaje
  created_at: now,
  text_content: textContent,
  status: "new",                  // <to do admin ui
  inspected: false
  };

  try {
    await Report.create(newReport)
  }
  catch (err) {
    console.error(`An error occured while trying to insert new Report object: ${err}`);
    return res.status(500).json({ success: false, error: "A database error has occured" });
  }

  res.status(201).json({ success: true, report: newReport });
};


export async function likeUser(req, res) {

  const id = req.user.userId;

  const user = await UserData.findOne({ user_id: id });

  if (!user) {
    return res.status(404).json({ error: "User profile not found" });
  }

  const otherId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(otherId)) {
    return res.status(400).json({ success: false, error: "Invalid user id" });
  };

  const otherUser = await UserData.findOne({ user_id: otherId });

  if (!otherUser) {
    return res.status(404).json({ error: "User profile not found" });
  }

  const like = await Like.findOne({ from_user: id, to_user: otherId });
  let newLike;
  const now = new Date();

  if (!like) {
    newLike = {
      from_user: id,
      to_user: otherId,
      created_at: now
    }

    try {
      await Like.create(newLike);
    }
    catch (err) {
      console.error(`An error occured while trying to insert new Like object: ${err}`);
      return res.status(500).json({ success: false, error: "A database error has occured" });
    }

  }

  const reversedLike = await Like.findOne({ from_user: otherId, to_user: id });

  if (!reversedLike) {
    return res.status(201).json({ success: true, like: newLike, match_created: false });
  }

  const newMatch = {
    user_A: id,
    user_B: otherId,
    created_at: now
  }

  try {
    await Match.create(newMatch);
  } catch (err) {
    console.error(`An error occured while trying to insert new Match object: ${err}`);
    return res.status(500).json({ success: false, error: "A database error has occured" });
  }

  const age = calculateAge(otherUser.date_of_birth);
  const distance = getDistance(
    { latitude: user.location.coordinates[1], longitude: user.location.coordinates[0] },
    { latitude: otherUser.location.coordinates[1], longitude: otherUser.location.coordinates[0] },
    100);

  res.status(201).json({ success: true, like: newLike, match_created: true, match: newMatch, user: { profile: otherUser, age: age, distance_km: distance / 1000 } });

};

export async function updateLocation(req,res) {
  const id = req.user.userId;
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, error: "Latitude and Longitude are required" });
  }

  try {
     const user = await UserData.findOneAndUpdate(
      { user_id: id },
      {
        $set: {
          location: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)]
          }
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "Users profile not found" });
    }

    res.status(200).json({
      success: true,
      userdata: user,
      message: "Location updated successfully"
    });

  } catch (err) {
    console.error(`Error occured while updating location: ${err}`);
    return res.status(500).json({ success: false, error: "A database error has occured." });
  }
}


//Usunięcie swojego profilu przez zalogowanego użytkownika/administratora
/*
/*
export function deleteUser(req, res) {
    const id = Number(req.params.id);
  const idx = users.findIndex(u => u.id===id);
  if (idx===-1){
    return res.status(404).json({error: "User not found"});
  }

  users.splice(idx,1);
  res.status(204).send();
}*/
