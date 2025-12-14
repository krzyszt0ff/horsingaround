import express from 'express';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { UserData } from '../models/UserData.js';
import { listUsers, addUser, updateUser, showUser, showMyProfile, reportUser, likeUser } from '../controllers/usersController.js'

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null,  path.join(process.cwd(), './uploads/')),
    filename: (req, file, cb) => cb(null, `${crypto.randomBytes(16).toString("hex")}${path.extname(file.originalname)}`)
})

const fileFilter = (req, file, cb) => {
  console.log('Multer file mimetype:', file.mimetype);
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({storage, fileFilter});

//zwraca przefiltrowaną wg preferencji listę użytkowników
//OUTPUT:
//  * jeśli nie ma błędów:
//      success: true,
//      metadata: {totalCount (liczba wszystkich znalezionych profili), page (która porcja z wynikami została zwrócona), 
//      page_size (ilość profili w jednej porcji)},
//      data: [] (lista z obiektami z danymi profili, w tym z dodatkowym polem "age", zawierającym obliczony wiek oraz "distance_km", z obliczonym dystansem do tej osoby)
//  * jeśli wystąpił błąd:
//      success: false,
//      error: "Opis błędu"
router.get('/', listUsers); 

//zwraca profil aktualnie zalogowanego użytkownika, kod statusu
router.get('/me', showMyProfile); 

//zwraca profil użytkownika o podanym id, kod statusu
//INPUT: w url id użytkownika, którego chcemy wyświetlić
//OUTPUT: obiekt {success: true , data: {user:, age:, distance_km:}}, gdzie user to profil wyciagnięty
//z bazy, age to obliczony wiek a distance to dystans zaokrąglony do 0,1 km
//LUB {success: false, error:}
router.get('/:id', showUser);



//zwraca utworzony profil użytkownika, kod statusu
//INPUT: UWAGA! MUSI BYĆ W multipart/form-data, NIE JSON!; Potrzebne pola:
//  * name
//  * date_of_birth
//  * bio 
//  * gender
//  * longitude
//  * latitude
//  * preferred_gender: jako lista, czyli robicie append do tego pola kilka razy, tyle ile jest wybranych płci
//  * preferred_min_age: 
//  * preferred_max_age:
//  * preferred_distance: w kilometrach
//  * wszystkie pola z modelu UserData OPRÓCZ: user_id, images_paths; 
//  * zdjęcia wrzucamy do pola photos, też kilka razy jeśli jest kilka zdjęć
//OUTPUT: success, data (obiekt z danymi utworzonego profilu)
router.post('/', upload.array('photos'), addUser);


//zwraca zaktualizowany profil użytkownika (tylko dane tekstowe), kod statusu
//INPUT: format multipart/form-data (używamy FormData na froncie), ale BEZ PLIKÓW!
//  * name
//  * bio
//  * gender
//  * date_of_birth
//  * preferred_min_age
//  * preferred_max_age
//  * preferred_distance -- TO NARAZIE WYJEBAŁAM BO MI PSUJE TYLKO I NIE WIEM DLACZEGO BEDZIE TRZEBA TO SPRAWDZIĆ I POPRAWIĆ <3
//  * preferred_gender: jako lista, czyli robicie append do tego pola kilka razy, tyle ile jest wybranych płci
//  * WAŻNE: ID użytkownika jest pobierane automatycznie z tokena (musi być zalogowany), nie podajemy go w URL
//OUTPUT: {success: true, data: (obiekt z danymi zaktualizowanego profilu)}
router.put('/update-profile', authMiddleware, upload.none(), async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      throw new Error("Brak User ID w tokenie");
    }
    let { 
      name, 
      bio, 
      gender, 
      date_of_birth,
      preferred_min_age, 
      preferred_max_age,
      preferred_gender 
    } = req.body;
    let genderArray = [];
    if (preferred_gender) {
      if (Array.isArray(preferred_gender)) {
         genderArray = preferred_gender;
      } else {
         genderArray = [preferred_gender];
      }
    }
    const updateData = {
      name,
      bio,
      gender,
      date_of_birth,
      preferred_min_age: Number(preferred_min_age), 
      preferred_max_age: Number(preferred_max_age), 
      preferred_gender: genderArray
    };
    const updatedUser = await UserData.findOneAndUpdate(
      { user_id: userId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "Profil nie znaleziony" });
    }
    res.status(200).json({ success: true, data: updatedUser });

  } catch (error) {
    console.error("!!! BŁĄD KRYTYCZNY W ROUTERZE !!!");
    console.error(error); 
    res.status(500).json({ success: false, error: error.message });
  }
});


//zwraca zaktualizowany profil użytkownika, kod statusu
//INPUT
//  * analogicznie do tworzenia profilu (form-data i nazwy pól), ale nie trzeba wszystkich pól, tylko te zmienione wystarczą
//  * WAŻNE!!! W przypadku modyfikacji zdjęć, przesyłacie w formdata TYLKO ZDJĘCIA NOWE (jeżeli są) w polu photos 
//    oraz w polu photos_to_delete ścieżki ze zdjęciami do usunięcia (o ile takie są) - tak jak wyżej, jeżeli jest ich kilka to robicie kilka appendów do tego pola,
//    nie przesyłacie listy aktualnych zdjęć
//  * jeżeli aktualizowane są współrzędne, to musi być przekazane longitude i latitude, nie tylko jedno!
//OUTPUT: {success: true, profile: }
router.patch('/:id', upload.array('photos'), updateUser);


// zgłaszanie innego użytkownika
//INPUT id zgłaszanego użytkownika w url, pocjonalnie text_content
//OUTPUT: {success: true, report:} LUB {success: false, error:}
router.post('/:id/report', reportUser);

// dawanie like'a innemu użytkownikowi
// INPUT: id like'owanego użytkownika w url
// OUTPUT:
//  * JEST MATCH: { success: true, like: newLike, match_created: true, match: , user: { profile: , age: , distance:  } }
//    Znaczenie pól: match - utworzony match, user - obiekt z danymi drugiego użytkownika z matcha: 
//    profile - profil z bazy, age - ile ma lat, distance_km - dystans od zalogowanego użytkownika w km
//  * NIE MA MATCHA: { success: true, like: , match_created: false }
router.post('/:id/like', likeUser);


//router.delete("/:id", deleteUser); ??

export default router;
