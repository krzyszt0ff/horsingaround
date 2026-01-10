import express from 'express';
import { listMatches, deleteMatch, listMessages, listChats } from '../controllers/matchesController.js';

const router = express.Router();

router.get('/',listMatches);                        //zwraca obiekty w postaci: kod statusu, id_matchu, obiekt z danymi profilu osoby z matcha, treść ostatniej wiadomości last_message
router.delete('/', deleteMatch);                    //zwraca kod statusu
router.get('/:matchid/messages', listMessages);     //zwraca kod statusu, wiadomości przypisane do czatu danego matcha posortowane malejąco (najpierw najnowsze);
router.get('/chats', listChats);                    //zwraca kod statusu, matche przypisane do użytkowika, ostatnią wiadomość

export default router;