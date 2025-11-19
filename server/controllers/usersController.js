import { UserData } from "../models/UserData.js";
import { UserCredentials } from "../models/UserCredentials.js";
import { Like } from "../models/Like.js";
import { Match } from "../models/Match.js";
import { Report } from "../models/Report.js";
import { getDistance } from 'geolib';
import mongoose from 'mongoose';
import * as z from 'zod';

const genderEnum = z.enum(["male", "female", "other"]);

const profileSchema = z.object({
  name: z.string().min(3).max(30).trim(),
  dateOfBirth: z.preprocess(val => {
    const date = new Date(val);
    return isNaN(date) ? undefined : date;
  }, z.date()),
  bio: z.string().max(300).optional().nullable(),
  gender: genderEnum,
  coordinates: z.tuple([
    z.preprocess(val => parseFloat(val), z.number().min(-180).max(180)),
    z.preprocess(val => parseFloat(val), z.number().min(-90).max(90))]),
  preferred_gender: z.array(genderEnum).min(1),
  preferred_age: z.tuple([
    z.preprocess(val => parseInt(val), z.number().min(18).max(98)),
    z.preprocess(val => parseInt(val), z.number().min(19).max(99))]).refine(
      ([first, second]) => first < second,
      { message: "The minimal age must be lower than the maximal age" }
    ),
  preferred_distance: z.preprocess(val => parseFloat(val), z.number().nonnegative().min(0.1).transform(val => Math.round(val * 10) / 10)),
  images_paths: z.array(z.string()).min(1).optional()
});


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

//Pobieranie przefiltrowanych danych użytkowników
// dodać walidację
// dodać zwracanie wieku i dystansu
// dodać brak wyświetlania profili, z którymi już mamy matcha
export async function listUsers(req, res) {

  let { page } = req.query;
  const page_size = 10;
  const user = req.user.userId;

  const userProfile = await UserData.findOne({ user_id: user });

  if (userProfile === null) {
    return res.status(404).json({ success: false, error: "User's profile cannot be found" });
  }

  const { gender, location, preferred_gender, preferred_age, preferred_distance } = userProfile;

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - preferred_age[0], today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - preferred_age[1], today.getMonth(), today.getDate());

  try {
    page = parseInt(page, 10) || 1;

    const users = await UserData.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: location
          },
          distanceField: "distance",
          maxDistance: preferred_distance,
          query: {
            gender: { $in: preferred_gender },
            preferred_gender: gender,
            dateOfBirth: { $gte: minDate, $lte: maxDate }
          },
          spherical: true
        }
      },
      {
        $addFields: {
          age: {
            $dateDiff: {
              startDate: "$dateOfBirth",
              endDate: today,
              unit: "year"
            }
          }
        }
      },
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

  const otherUser = await UserData.findOne({ user_id: otherId });

  if (!otherUser) {
    return res.status(404).json({ success: false, error: "User profile not found" });
  }

  const age = calculateAge(otherUser.dateOfBirth);
  const distance = getDistance(
    { latitude: user.location.coordinates[1], longitude: user.location.coordinates[0] },
    { latitude: otherUser.location.coordinates[1], longitude: otherUser.location.coordinates[0] },
    100);

  res.json({ success: true, data: { user: otherUser, age: age, distance: distance } });
}

//Pobieranie własnego profilu
export async function showMyProfile(req, res) {

  const id = req.user.userId;

  const user = await UserData.findOne({ user_id: id });

  if (!user) {
    return res.status(404).json({success: false, error: "User profile not found" });
  }

  const age = calculateAge(user.dateOfBirth);

  res.json({ success: true, data: { user: user, age: age } });

}

//Tworzenie danych profilu
export async function addUser(req, res) {

  const id = req.user.userId;

  const result = profileSchema.safeParse(req.body);

  if (!result.success){
    return res.status(400).json({success: false, error: z.flattenError(result.error)});
  }

  const { name, dateOfBirth, bio, gender, coordinates, preferred_gender, preferred_age, preferred_distance} = result.data;
  const photos = req.files;
  let images_paths = [];


  for (let i=0; i<photos.length; i++){
    images_paths.push(photos[i].path);
  };


  const user = await UserData.findOne({ user_id: id });

  if (user !== null) {
    return res.status(409).json({ success: false, error: "User's profile already exists" });
  }

  const newProfile = {
    user_id: id,
    name: name,
    dateOfBirth: dateOfBirth,
    bio: bio,
    gender: gender,
    location: {
      coordinates: coordinates
    },
    preferred_gender: preferred_gender,
    preferred_age: preferred_age,
    preferred_distance: preferred_distance,
    images_paths: images_paths
  };

  try {
    await UserData.insertOne(newProfile);
  }
  catch (err) {
    console.error(`An error occured while trying to insert new UserData object: ${err}`);
    return res.status(500).json({ success: false, error: "A database error has occured" });
  }

  res.status(201).json({ success: true, data: newProfile });
};

//Aktualizacja danych w profilu zalogowanego użytkownika
//DOKOŃCZYĆ
export async function updateUser(req, res) {

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)){
    return res.status(400).json({success: false, error: "Invalid user id"});
  }

  const user = await UserData.findOne({user_id: id});

  if (!user){
    return res.status(404).json({success: false, error: "User profile not found"});
  }

  const patchSchema = profileSchema.partial();
  const result = patchSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ success: false, error: z.flattenError(result.error) });
  }
  const updateData = result.data;


  
  const photosToDelete = req.body.photos_to_delete || [];
  let images = user.images_paths;

  if (photosToDelete.length>0){
    
  }

  const newPhotos = req.files;

  if (photos.length>0){
    for (let i=0; i<photos.length;i++){
      images.push(photos[i]);
    }
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
    return res.status(404).json({success: false, error: "Reported user not found"});
  }

  const textContentSchema = z.string().trim().nonempty().optional();
  const result = textContentSchema.safeParse(req.body.text_content);

  if (!result.success){
    return res.status(400).json({success: false, error: z.flattenError(result.error)});
  }

  const textContent = result.data;

  const now = new Date();

  const newReport = {
    reporter_id: id,
    reported_user_id: otherId,
    created_at: now,
    text_content: textContent,
    inspected: false
  };

  try {
    await Report.insertOne(newReport)
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

  if (!like) {
    const now = new Date();
    newLike = {
      from_user: id,
      to_user: otherId,
      created_at: now
    }

    try {
      await Like.insertOne(newLike);
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
    await Match.insertOne(newMatch);
  } catch (err) {
    console.error(`An error occured while trying to insert new Match object: ${err}`);
    return res.status(500).json({ success: false, error: "A database error has occured" });
  }

  const age = calculateAge(otherUser.dateOfBirth);
  const distance = getDistance(
    { latitude: user.location.coordinates[1], longitude: user.location.coordinates[0] },
    { latitude: otherUser.location.coordinates[1], longitude: otherUser.location.coordinates[0] },
    100);

  res.status(201).json({ success: true, like: newLike, match_created: true, match: newMatch, user: { profile: otherUser, age: age, distance: distance } });

};


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

}*/
