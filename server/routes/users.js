import express from 'express';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { listUsers, addUser, updateUser, showUser, showMyProfile, reportUser, likeUser } from '../controllers/usersController.js'



const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "/uploads"),
    filename: (req, file, cb) => cb(null, `${crypto.randomBytes(16).toString("hex")}${path.extname(file.originalName)}`)
})

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({storage, fileFilter});
const router = express.Router();

//zwraca przefiltrowaną wg preferencji listę użytkowników
//OUTPUT:
//  * jeśli nie ma błędów:
//      success: true,
//      metadata: {totalCount (liczba wszystkich znalezionych profili), page (która porcja z wynikami została zwrócona), 
//      page_size (ilość profili w jednej porcji)},
//      data: [] (lista z obiektami z danymi profili, w tym z dodatkowym polem "age", zawierającym obliczony wiek oraz "distance", z obliczonym dystansem do tej osoby)
//  * jeśli wystąpił błąd:
//      success: false,
//      error: "Opis błędu"
router.get('/', listUsers); 

//zwraca profil użytkownika o podanym id, kod statusu
//INPUT: w url id użytkownika, którego chcemy wyświetlić
//OUTPUT: obiekt {success: true , data: {user:, age:, distance:}}, gdzie user to profil wyciagnięty
//z bazy, age to obliczony wiek a distance to dystans zaokrąglony do 0,1 km
//LUB {success: false, error:}
router.get('/:id', showUser);

//zwraca profil aktualnie zalogowanego użytkownika, kod statusu
router.get('/me', showMyProfile); 

//zwraca utworzony profil użytkownika, kod statusu
//INPUT: UWAGA! MUSI BYĆ W multipart/form-data, NIE JSON!; 
//  * wszystkie pola z modelu UserData OPRÓCZ: user_id, images_paths; 
//  * lokalizację podajemy w polu coordinates jako listę [longitude, latitude];
//  * preferred_distance w km; 
//  * format przekazania preferred_age i preferred_gender jest w modelu UserData
//OUTPUT: success, data (obiekt z danymi utworzonego profilu)
router.post('/', upload.array('photos',10), addUser);

//zwraca zaktualizowany profil użytkownika, kod statusu
//INPUT
//  * WSZYSTKIE pola, które zostały zmodyfikowane w profilu
//  * WAŻNE!!! W przypadku modyfikacji zdjęć, przesyłacie w formdata TYLKO ZDJĘCIA NOWE (jeżeli są) 
//    oraz w polu photos_to_delete listę ścieżek ze zdjęciami do usunięcia (o ile takie są)
//    jeżeli nic w zdjęciach nie jest zmieniane, to wysyłacie zwykłego jsona tylko ze zmienionymi polami
//OUTPUT: {success: true, profile: }
router.patch('/:id', upload.array('photos',10), updateUser);

// zgłaszanie innego użytkownika
//INPUT id zgłaszanego użytkownika w url
//OUTPUT: {success: true, report:} LUB {success: false, error:}
router.post('/:id/report', reportUser);

// dawanie like'a innemu użytkownikowi
// INPUT: id like'owanego użytkownika w url
// OUTPUT:
//  * JEST MATCH: { success: true, like: newLike, match_created: true, match: , user: { profile: , age: , distance:  } }
//    Znaczenie pól: match - utworzony match, user - obiekt z danymi drugiego użytkownika z matcha: 
//    profile - profil z bazy, age - ile ma lat, distance - dystans od zalogowanego użytkownika w km
//  * NIE MA MATCHA: { success: true, like: , match_created: false }
router.post('/:id/like', likeUser);


//router.delete("/:id", deleteUser); ??

export default router;
