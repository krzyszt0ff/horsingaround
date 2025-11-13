import express from 'express';
import { listUsers, addUser, updateUser, showUser, showMyProfile, reportUser, likeUser } from '../controllers/usersController.js'

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "/uploads"),
    filename: (req, file, cb) => cb(null, `${crypto.randomBytes(16).toString("hex")}${path.extname(file.originalName)}`)
})

const upload = multer({storage});
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
router.get('/:id', showUser);

//zwraca profil aktualnie zalogowanego użytkownika, kod statusu
router.get('/me', showMyProfile); 

//zwraca utworzony profil użytkownika, kod statusu
//INPUT: wszystkie pola z modelu UserData OPRÓCZ: user_id, location, images_paths; preferred_distance w km; format przekazania preferred_age i preferred_gender jest w modelu UserData
//OUTPUT: success, data (obiekt z danymi utworzonego profilu)
router.post('/', addUser);

 //zwraca zmodyfikowany profil użytkownika, kod statusu | input: obiekt z wypełnionymi wszystkimi polami profilu użytkownika, nazwanymi zgodnie z modelem
router.put('/:id', updateUser);

//zwraca utworzone zgłoszenie, kod statusu
router.post('/:id/report', reportUser);

 //zwraca kod statusu matchCreated (true lub false)
router.post('/:id/like', likeUser);


//router.delete("/:id", deleteUser); ??

export default router;
