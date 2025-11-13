import { UserData } from "../models/UserData.js";



//Pobieranie przefiltrowanych danych użytkowników, którym już można dać like'a
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
export function showUser(req, res) {
  const id = Number(req.params.id);
  const idx = users.findIndex(u => u.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(users[idx]);
}

export function showMyProfile(req, res) {

}

//To funkcja do tworzenia danych profilu, nie rejestracji użytkownika!!!
//Rejestracja użytkownika odbywa się przez funkcję register pod adresem /api/auth/register, w authController.js i auth.js w routerach
export async function addUser(req, res) {

  //dodać obsługę obrazków!!!
  let errors = [];
  const id = req.user.userId;
  const { name, dateOfBirth, bio, gender, preferred_gender, preferred_age, preferred_distance, coordinates } = req.body;

  if (!name || !dateOfBirth || !gender || !preferred_gender || !preferred_age || !preferred_distance || !coordinates) {
    errors.push("Required fields missing");
  }



  //walidacja pól: Name ciąg znaków do iluś liter i tylko liter, dateOfBirth taka że wiek >= 18  itp, lokalizacji itp

  const preferred_distance_m = preferred_distance * 1000;

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors });
  }

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
    const result = await UserData.insertOne(newProfile);
  }
  catch (err) {
    console.error(`An error occured while trying to insert new UserData object: ${err}`);
    return res.status(500).json({ success: false, error: "A database error has occured" });
  }

  res.status(201).json({ success: true, data: newProfile });
};

//Aktualizacja danych w profilu zalogowanego użytkownika
export function updateUser(req, res) {
  const id = Number(req.params.id);
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users[idx] = {
    id,
    name: req.body.name,
    age: req.body.age,
    bio: req.body.bio
  }
  res.json(users[idx]);
}

export function reportUser(req, res) { };


export function likeUser(req, res) { };

//Usunięcie swojego profilu przez zalogowanego użytkownika/administratora
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
