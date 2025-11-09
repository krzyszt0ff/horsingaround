import express from 'express';
import { listUsers, addUser, updateUser, showUser, showMyProfile, reportUser, likeUser } from '../controllers/usersController.js'

const router = express.Router();


router.get('/', listUsers); //zwraca przefiltrowaną wg preferencji listę użytkowników, kod statusu, metadane o kolejnych porcjach danych
router.get('/:id', showUser); //zwraca profil użytkownika o podanym id, kod statusu
router.get('/me', showMyProfile); //zwraca profil aktualnie zalogowanego użytkownika, kod statusu
router.post('/', addUser); //zwraca utworzony profil użytkownika, kod statusu
router.put('/:id', updateUser); //zwraca zmodyfikowany profil użytkownika, kod statusu | input: obiekt z wypełnionymi wszystkimi polami profilu użytkownika, nazwanymi zgodnie z modelem
router.post('/:id/report', reportUser);//zwraca utworzone zgłoszenie, kod statusu
router.post('/:id/like', likeUser); //zwraca kod statusu matchCreated (true lub false)
//router.delete("/:id", deleteUser); ??

export default router;
